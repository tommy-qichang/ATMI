import logging
import os
import re
from typing import Dict

import pydicom
from pydicom import Sequence

from atmi_backend.config import INSTANCE_NUMBER, SERIES_DESCRIPTION, SERIES_NUMBER

log = logging.getLogger(__name__)


class DICOMParser:

    @staticmethod  # noqa: C901
    def extract_series(parent_path, file_list):
        """
        Extract list of dicom by series id.
        :param parent_path
        :param file_list:
        :return:
        """
        # Gather file data and put in DicomSeries
        series_map: Dict[str, DicomSeries] = {}
        for file_name in file_list:
            file_path = os.path.join(parent_path, file_name)
            try:
                dcm = pydicom.dcmread(file_path, stop_before_pixels=True, force=True)

            except Exception as e:
                log.warning("Warning:", e)
                continue

            instance_number = dcm.get(INSTANCE_NUMBER)
            if instance_number == "":
                log.warning(
                    f"skip dicom file:{file_name} with invalid InstanceNumber:{instance_number}"
                )
                continue

            # Get SUID and register the file with an existing or new series object
            try:
                suid = dcm.SeriesInstanceUID
                # slice_location = str(dcm.SliceLocation)
            except AttributeError:
                log.warning(f"some other kind of dicom file: {file_name}")
                continue

            complex_id = suid
            # TODO: we should setup the ability to config series sorting arguments.
            # if len(file_list)>50:
            #     complex_id = suid+"_"+slice_location

            if complex_id not in series_map:
                series_map[complex_id] = DicomSeries(complex_id)
            series_map[complex_id].append(dcm, file_name)

        # Make a list and sort, so that the order is deterministic
        series = list(series_map.values())
        series.sort(key=lambda x: x.suid)

        # Finish all series
        series_ = []
        for i in range(len(series)):
            try:
                series[i].sort()
                series[i].finish()
                series_.append(series[i])
            except Exception as e:
                log.warning(
                    f"Skip series '{series[i].description}' (probably report-like file without pixels). {str(e)}"
                )

        return series_


class DicomSeries(object):
    """ DicomSeries
    This class represents a series of dicom files that belong together.
    If these are multiple files, they represent the slices of a volume
    (like for CT or MRI). The actual volume can be obtained using loadData().
    Information about the data can be obtained using the info attribute.
    """

    # To create a DicomSeries object, start by making an instance and
    # append files using the "append" method. When all files are
    # added, call "_sort" to sort the files, and then "_finish" to evaluate
    # the data, perform some checks, and set the shape and sampling
    # attributes of the instance.

    def __init__(self, suid, split_num=0):
        # Init dataset list and the callback
        self._datasets = Sequence()
        self._filenames = []

        # Init props
        self._suid = suid
        self._info = None
        self._shape = None
        self._sampling = None
        self._split_num = split_num

    @property
    def name(self):
        series_description = self._info.get(SERIES_DESCRIPTION, "non")
        series_num = self._info.get(SERIES_NUMBER, "non")
        name = f"{series_description}_{series_num}{self._split_num}"
        return re.sub("[^0-9a-zA-Z]+", "_", name)

    @property
    def suid(self):
        """ The Series Instance UID. """
        return self._suid

    @property
    def shape(self):
        """ The shape of the data (nz, ny, nx).
        If None, the series contains a single dicom file. """
        return self._shape

    @property
    def sampling(self):
        """ The sampling (voxel distances) of the data (dz, dy, dx).
        If None, the series contains a single dicom file. """
        return self._sampling

    @property
    def info(self):
        """ A DataSet instance containing the information as present in the
        first dicomfile of this series. """
        return self._info

    @property
    def length(self):
        return len(self._filenames)

    @property
    def filenames(self):
        return self._filenames

    @property
    def description(self):
        """ A description of the dicom series. Used fields are
        PatientName, shape of the data, SeriesDescription,
        and ImageComments.
        """

        info = self.info

        # If no info available, return simple description
        if info is None:
            return "DicomSeries containing %i images" % len(self._datasets)

        fields = []

        # Try adding more fields
        if "SeriesDescription" in info:
            fields.append(info.SeriesDescription)

        # Give patient name
        if "PatientName" in info:
            fields.append(str(info.PatientName))

        # Also add dimensions
        if self.shape:
            tmp = [str(d) for d in self.shape]
            fields.append("x".join(tmp))

        if "ImageComments" in info:
            fields.append(info.ImageComments)

        # Combine
        return "_".join(fields)

    def __repr__(self):
        adr = hex(id(self)).upper()
        data_len = len(self._datasets)
        return "<DicomSeries with %i images at %s>" % (data_len, adr)

    def append(self, dcm, file_name):
        """ append(dcm)
        Append a dicomfile (as a pydicom.dataset.FileDataset) to the series.
        """
        self._datasets.append(dcm)
        self._filenames.append([file_name, dcm.InstanceNumber])

    def sort(self):
        """ sort()
        Sort the datasets by instance number.
        """
        self._datasets.sort(key=lambda k: k.InstanceNumber)
        self._filenames.sort(key=lambda k: k[1])
        self._filenames = [v for [v, t] in self._filenames]

    def finish(self):
        """ _finish()

        Evaluate the series of dicom files. Together they should make up
        a volumetric dataset. This means the files should meet certain
        conditions. Also some additional information has to be calculated,
        such as the distance between the slices. This method sets the
        attributes for "shape", "sampling" and "info".

        This method checks:
          * that there are no missing files
          * that the dimensions of all images match
          * that the pixel spacing of all images match

        """

        # The datasets list should be sorted by instance number
        L = self._datasets
        if len(L) == 0:
            return
        elif len(L) < 2:
            # Set attributes
            ds = self._datasets[0]
            self._info = self._datasets[0]
            self._shape = [ds.Rows, ds.Columns]
            self._sampling = [float(ds.PixelSpacing[0]), float(ds.PixelSpacing[1])]
            return

        # Get previous
        ds1 = L[0]

        # Init measures to calculate average of
        distance_sum = 0.0

        # Init measures to check (these are in 2D)
        dimensions = ds1.Rows, ds1.Columns

        # row, column
        if 'PixelSpacing' not in ds1:
            # ds1 = list(ds1)
            ds1.add_new(0x00280030, "PixelData", (0.5, 0.5))
            log.warning("Warning:PixelSpacing is missing, replace with (.5, .5)")

        sampling = float(ds1.PixelSpacing[0]), float(ds1.PixelSpacing[1])

        for index in range(len(L)):
            # The first round ds1 and ds2 will be the same, for the
            # distance calculation this does not matter

            # Get current
            ds2 = L[index]

            # Get positions
            pos1 = float(ds1.ImagePositionPatient[2])
            pos2 = float(ds2.ImagePositionPatient[2])

            # Update distance_sum to calculate distance later
            distance_sum += abs(pos1 - pos2)

            # Test measures
            dimensions2 = ds2.Rows, ds2.Columns

            if 'PixelSpacing' not in ds2:
                # ds1 = list(ds1)
                ds2.add_new(0x00280030, "PixelData", (0.5, 0.5))

            sampling2 = float(ds2.PixelSpacing[0]), float(ds2.PixelSpacing[1])
            if dimensions != dimensions2:
                # We cannot produce a volume if the dimensions match
                raise ValueError("Dimensions of slices does not match.")
            if sampling != sampling2:
                # We can still produce a volume, but we should notify the user
                log.warning("Warning: sampling does not match.")
            # Store previous
            ds1 = ds2

        # Create new dataset by making a deep copy of the first
        info = pydicom.dataset.Dataset()
        firstDs = self._datasets[0]
        for key in firstDs.keys():
            if key != (0x7FE0, 0x0010):
                el = firstDs[key]
                info.add_new(el.tag, el.VR, el.value)

        # Finish calculating average distance
        # (Note that there are len(L)-1 distances)
        distance_mean = distance_sum / (len(L) - 1)

        # Store information that is specific for the series
        self._shape = [len(L), ds2.Rows, ds2.Columns]
        self._sampling = [
            distance_mean,
            float(ds2.PixelSpacing[0]),
            float(ds2.PixelSpacing[1]),
        ]

        # Store
        self._info = info
        # Delete dataset for performance reason.
        del self._datasets
