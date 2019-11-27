import os

import h5py
import numpy as np
import pydicom
from flask import Flask

from atmi_backend.constant import OUTPUT_ROOT
from atmi_backend.db_interface.LabelService import LabelService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.StudiesService import StudiesService

# log = logging.getLogger(__name__)
app = Flask("atmi.app")


class ExportService:
    def __init__(self, connection):
        self.conn = connection

    def save_onestudy(self, study_id):
        """
        Save all annotations and and dicom data for each study
        :return:
        """
        msg_box = []
        study_service = StudiesService(self.conn)
        study = study_service.query({"study_id": study_id})
        instance_id = study[0]['instance_id']
        app.logger.info(f"Save study- instance_id:{instance_id},study_id:{study_id}")
        h5_path = os.path.join(OUTPUT_ROOT, str(instance_id))
        if not os.path.exists(h5_path):
            os.makedirs(h5_path)
        study_h5 = h5py.File(os.path.join(h5_path, f"{study[0]['patient_uid']}-{study[0]['study_uid']}.h5"), 'w')


        series_service = SeriesService(self.conn)
        label_service = LabelService(self.conn)
        series = series_service.query({"study_id": study_id})
        for i in series:
            series_id = i['series_id']
            series_uuid = i['series_instance_uid']
            x_dim = int(i['x_dimension'])
            y_dim = int(i['y_dimension'])
            z_dim = int(i['z_dimension'])
            series_files_list = eval(i['series_files_list'])
            series_label = np.zeros((x_dim, y_dim, z_dim))
            labels = label_service.query({"series_id": series_id})
            if len(labels) == 0:
                app.logger.debug(f"The current series don't have labels:{i['series_id']}")
                continue
            for label in labels:
                file_id = label['file_id']
                content = eval(label['content'])
                pixel_data = content['labelmap2D']['pixelData']
                pixel_data_xy = np.reshape(pixel_data, [x_dim, y_dim])
                z_index = series_files_list.index(file_id)
                series_label[:, :, z_index] = pixel_data_xy

            label_db = study_h5.create_dataset(f"study:{study[0]['suid']}/series:{series_uuid}/label",
                                               data=series_label)
            label_db.attrs['path'] = i['series_path']
            label_db.attrs['series_id'] = i['series_id']
            label_db.attrs['study_id'] = i['study_id']
            label_db.attrs['description'] = i["series_description"]
            label_db.attrs['files'] = i['series_files_list']
            app.logger.debug(f"Save one series - path:{i['series_path']}, series_id:{i['series_id']}")
            msg_box.append(f"Save one series - path:{i['series_path']}, series_id:{i['series_id']}")

            # Load DICOM data.
            file_list = [os.path.join(i['series_path'], file_name) for file_name in eval(i['series_files_list'])]
            series_dcm = []
            for file in file_list:
                file_dcm = pydicom.dcmread(file)
                series_dcm.append(file_dcm.pixel_array)

            series_dcm = np.stack(series_dcm)
            series_dcm = np.moveaxis(series_dcm, 0, -1)

            # if the dimension of original dicom and label mismatch should throw an error, and log.
            if series_dcm.shape != series_label.shape:
                app.logger.warn(
                    f"The original DICOM shape({series_dcm.shape}) mismatch with the label's shape({series_label.shape})")
            dcm = study_h5.create_dataset(f"study:{study[0]['suid']}/series:{series_uuid}/dcm", data=series_dcm)
            dcm.attrs['x_spacing'] = i['x_spacing']
            dcm.attrs['y_spacing'] = i['y_spacing']
            dcm.attrs['z_spacing'] = i['z_spacing']
            dcm.attrs['patient_id'] = i['patient_id']
            dcm.attrs['files'] = i['series_files_list']
            dcm.attrs['path'] = i['series_path']

        study_h5.close()
        return msg_box
