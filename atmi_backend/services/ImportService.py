import json
import os

import h5py
import numpy as np
from flask import Flask

from atmi_backend.config import DATA_ROOT, INSTANCE_STATUS, STUDY_STATUS, SERIES_STATUS
from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.LabelService import LabelService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.StudiesService import StudiesService
from atmi_backend.services.SeriesExtractionService import SeriesExtractionService
app = Flask("atmi.app")

class ImportService:
    def __init__(self, connection):
        self.conn = connection

    def import_dcm(self, instance_id, data_path):

        instance_service = InstanceService(self.conn)
        instance_service.update({'instance_id': instance_id}, {'status': INSTANCE_STATUS.importing_dicom.value})
        series_extraction_service = SeriesExtractionService()
        all_series_list = series_extraction_service.extract_series_from_path(os.path.join(DATA_ROOT, data_path))
        study_service = StudiesService(self.conn)
        series_service = SeriesService(self.conn)

        for suid in all_series_list:
            series = all_series_list[suid]
            patient_uid = 0
            study_uid = 0
            study_service.insert(instance_id, patient_uid, study_uid, suid, "[]", 0, 0)
            study = study_service.query({"instance_id": instance_id, "suid": suid})
            study = study[0]
            total_files_number = 0
            folder_name_arr = []
            for series_path in series:
                folder_name_arr.append(series_path)
                for one_series in series[series_path]:
                # one_series = series[series_path][0]
                    if "PatientID" in one_series.info:
                        patient_uid = one_series.info.PatientID
                    else:
                        patient_uid = ""
                    if "StudyID" in one_series.info:
                        study_uid = one_series.info.StudyID
                    else:
                        study_uid = suid
                    # if patient_uid == "" or study_uid == "":
                    #     patient_uid = ""
                    #     study_uid = suid
                    # disp_name = "pid:" + one_series.info.PatientID + "_sid:" + one_series.info.StudyID
                    total_files_number += one_series.length
                    series_info = one_series.info
                    if len(one_series.shape) == 2:
                        z_dim = 1
                        x_dim = one_series.shape[0]
                        y_dim = one_series.shape[1]
                    else:
                        z_dim = one_series.shape[0]
                        x_dim = one_series.shape[1]
                        y_dim = one_series.shape[2]

                    series_service.insert(study['study_id'], one_series.description, series_path, one_series.filenames,
                                          one_series.length, series_info.get("WindowWidth"),
                                          series_info.get("WindowCenter"), one_series.sampling[1], one_series.sampling[1],
                                          one_series.sampling[0], x_dim, y_dim, z_dim, series_info.get("PatientID"),
                                          series_info.get("SeriesInstanceUID"), series_info.get("StudyDate") or "", "",
                                          "", SERIES_STATUS.init.value)

            study_service.update({"instance_id": instance_id, "suid": suid},
                                 {"total_files_number": total_files_number, "patient_uid": patient_uid,
                                  "study_uid": study_uid, "folder_name": str(folder_name_arr),
                                  "status": STUDY_STATUS.ready_to_annotate.value})

        instance_service.update({'instance_id': instance_id}, {'status': INSTANCE_STATUS.ready_to_annotate.value})
        return True

    def import_annotations(self, load_type, annotation_path, erase_old=True):
        """
        Load saved annotations.
        Please be caution!
        This operation will firstly erase old masks if not set erase_old as False and then replace with the new one.
        :param load_type: 'h5'|'mhd'
        :param annotation_path:
        :param erase_old:
        :return:
        """
        if load_type == "h5":
            labeldb = h5py.File(annotation_path, 'r')
            # studyService = StudiesService(self.conn)
            seriesService = SeriesService(self.conn)
            labelService = LabelService(self.conn)

            labeldb = labeldb['train']

            labeldb_key = list(labeldb.keys())
            for idx, study_and_series_id in enumerate(labeldb_key):
                split_str = study_and_series_id.split("-", 1)
                study_uid = split_str[0][6:]
                series_uid_with_imgid = split_str[1][7:]

                series_split_str = series_uid_with_imgid.split("[")
                series_uid = series_split_str[0]
                img_id = None
                if len(series_split_str) == 2:
                    img_id = series_split_str[1][:-1]

                series = seriesService.query({"series_instance_uid": series_uid})

                for series_idx in series:
                    slice_file_name = eval(series_idx['series_files_list'])
                    if img_id is None or img_id == slice_file_name[0]:
                        content_3D = labeldb[f"study:{study_uid}-series:{series_uid}[{img_id}]/label"][()]
                        app.logger.info(f"Import label for study({idx}/{len(labeldb_key)}):{study_uid}-series:{series_uid}/, with imgid start from:{img_id}, unique label:{np.unique(content_3D)}")
                        for i in range(len(slice_file_name)):
                            if i < content_3D.shape[2]:
                                content_2D = content_3D[:, :, i]
                                x_dim = content_2D.shape[0]
                                y_dim = content_2D.shape[1]
                                content_1D = np.reshape(content_2D, x_dim * y_dim)

                                unique_id = np.unique(content_1D).tolist()
                                compressed_content_1D = LabelService.compress_content(content_1D)
                                content = {
                                    "labelmap2D": {"pixelData": compressed_content_1D, "segmentsOnLabelmap": unique_id,
                                                   "dataLength": content_1D.shape[0]}}
                                labelService.insert(series_idx['series_id'], 1, slice_file_name[i],
                                                    str.encode(json.dumps(content)))
                        seriesService.update({"series_instance_uid": series_uid}, {"status":SERIES_STATUS.mask_is_ready.value})

        elif load_type == 'mhd':
            raise NotImplementedError()


# if __name__ == "__main__":
#     ini_service = InitialService()
#     importService = ImportService(ini_service.get_connection())
#     # importService.import_annotations("h5", "/Users/qichang/PycharmProjects/pytorch-template/data/ACDC/processed/Export-1-Cardial_MRI_DB-0-predict-final-x4.h5")
#     importService.import_annotations("h5",
#                                      "/Users/qichang/PycharmProjects/ATMI/data/test3/3891405-1_0.85528576_new.h5")

# http://127.0.0.1:5000/load_data/2/NYU_CMR_Raw
# http://127.0.0.1:5000/export_label/studies/2
