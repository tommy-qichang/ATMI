import json
import sqlite3

from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class SeriesService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if record exist by query_obj.
        :param query_obj:
        :return: None or record object.
        """

        sql = prepare_query("series", query_obj,
                            ['series_id', 'study_id', 'series_description', 'series_files_list', 'series_files_number',
                             'window_width', 'window_level', 'x_spacing', 'y_spacing', 'z_spacing', 'patient_id',
                             'study_date', 'intercept', 'slop'])

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]

        return result

    def insert(self, study_id, series_description, series_files_list, series_files_number,
               window_width, window_level, x_spacing, y_spacing, z_spacing, patient_id,
               study_date, intercept, slop):
        """
        Insert record for new instance.
        :param instance_id:
        :param folder_name:
        :param total_files_number:
        :return:
        """

        if len(self.query({"study_id": study_id, "series_description": series_description})) != 0:
            return False
        cur = self.sql_connection.cursor()

        sql, v = prepare_insert("series", {"study_id": study_id, "series_description": series_description,
                                           "series_files_list": series_files_list,
                                           "series_files_number": series_files_number, "window_width": window_width,
                                           "window_level": window_level, "x_spacing": x_spacing, "y_spacing": y_spacing,
                                           "z_spacing": z_spacing, "patient_id": patient_id, "study_date": study_date,
                                           "intercept": intercept, "slop": slop})
        cur.execute(sql, v)
        self.sql_connection.commit()
        return True

    def delete(self, del_condition):
        """
        Delete studies by the del_condition: {series_id:''} or {study_id:'', series_description:''}
        :param
        :return: True if the user exist. False if not.
        """
        if len(self.query(del_condition)) == 0:
            return False
        sql = prepare_delete("series", del_condition,
                             ['series_id', 'study_id', 'series_description', 'series_files_list', 'series_files_number',
                              'window_width', 'window_level', 'x_spacing', 'y_spacing', 'z_spacing', 'patient_id',
                              'study_date', 'intercept', 'slop'])

        cur = self.sql_connection.cursor()

        cur.execute(sql)
        self.sql_connection.commit()
        return True

    def update(self, update_condition, modify_obj):
        """
        Modify studies by the name or data_path .
        :param update_condition: {study_id:''} or {instance_id:'', folder_name:''}
        :param modify_obj: modify object, keys are all optional. ['study_id', 'instance_id', 'folder_name', 'total_files_number']
        :return:
        """
        if len(self.query(update_condition)) == 0:
            return False
        sql, v_tuple = prepare_update("series", update_condition, modify_obj,
                                      ['series_id', 'study_id', 'series_description', 'series_files_list',
                                       'series_files_number', 'window_width', 'window_level', 'x_spacing', 'y_spacing',
                                       'z_spacing', 'patient_id', 'study_date', 'intercept', 'slop'])
        cur = self.sql_connection.cursor()

        cur.execute(sql, v_tuple)
        self.sql_connection.commit()
        return True
