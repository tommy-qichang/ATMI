import os
import re

from atmi_backend.config import QUALIFIED_FILE_EXT
from atmi_backend.services.DICOMParser import DICOMParser


class SeriesExtractionService:

    def extract_series_from_path(self, folder_path):
        """
        List all dicom files and extract different series, return series list.
        :param folder_path:
        :return:
        """
        files_list = self.list_files(folder_path)
        parser = DICOMParser()
        all_series_list = {}
        for k, l in files_list.items():
            print(f'Extract Series from path:{k}...')
            all_series = parser.extract_series(k, l)
            all_series_list[k] = all_series

        all_study_list = {}
        for i in all_series_list:
            one_series = all_series_list[i]
            if len(one_series) > 0:
                study_id = str(one_series[0].info['StudyInstanceUID'].value)
                if study_id not in all_study_list:
                    all_study_list[study_id] = {}
                all_study_list[study_id][i] = one_series
            else:
                print(f"Error in series index:{i}")

        return all_study_list

    def is_quaified_image(self, file_name):
        # Add different parser for png etc.

        matches = re.findall(r"|".join(QUALIFIED_FILE_EXT), file_name, re.I)

        return len(matches) > 0

    def list_files(self, parent_path, files_list=None):
        """List all files in the directory with hierarchy structure, recursively. """
        if files_list is None:
            files_list = {}
        for item in sorted(os.listdir(parent_path)):
            item_path = os.path.join(parent_path, item)
            if os.path.isdir(item_path):
                self.list_files(item_path, files_list)
            elif self.is_quaified_image(item):
                if parent_path not in files_list:
                    files_list[parent_path] = []
                files_list[parent_path].append(item)
        return files_list
