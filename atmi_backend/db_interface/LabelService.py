import sqlite3

import numpy as np

from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update, \
    prepare_exists


class LabelService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def exist(self, query_obj):
        sql = prepare_exists("labels", query_obj,
                             ["label_id", "series_id", "user_id", "file_id", "content"])
        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()

        result = dict(result[0])

        if len(result) > 0 and dict(result[0]).values()[0] == 1:
            return True

        return False

    def query(self, query_obj):
        """
        Check if record exist by query_obj.
        :param query_obj:
        :return: None or record object.
        """

        sql = prepare_query("labels", query_obj,
                            ["label_id", "series_id", "user_id", "file_id", "content"])
        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]
        for record in result:
            if isinstance(record['content'], bytes):
                record['content'] = record['content'].decode('utf-8')
            else:
                record['content'] = record['content']
        return result

    def insert(self, series_id, user_id, file_id, content):
        """
        Insert new record for LabelCandidates.
        :param series_id:
        :param user_id:
        :param file_id:
        :param content:
        :return:
        """
        cur = self.sql_connection.cursor()
        has_record = len(self.query({"series_id": series_id, "user_id": user_id, "file_id": file_id})) > 0

        # has_record = self.exist({"series_id": series_id, "user_id": user_id, "file_id": file_id})
        if has_record:
            status = self.update({"series_id": series_id, "user_id": user_id, "file_id": file_id},
                                 {"content": content})
        else:
            sql, v = prepare_insert("labels",
                                    {"series_id": series_id, "user_id": user_id,
                                     "file_id": file_id, "content": content})
            cur.execute(sql, v)
            self.sql_connection.commit()
            status = True
        return status

    def delete(self, del_condition):
        """
        Delete instance by the del_condition: {instance_id:''} or {candidate_id:''}
        :param
        :return: True if the user exist. False if not.
        """
        if len(self.query(del_condition)) == 0:
            return False
        sql = prepare_delete("labels", del_condition,
                             ["label_id", "candidate_id", "series_id", "user_id", "file_id", "content"])

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        self.sql_connection.commit()
        return True

    def update(self, update_condition, modify_obj):
        """
        Modify user by the name or data_path .
        :param update_condition: {instance_id:''} and {text:''}
        :param modify_obj: modify object, keys are all optional.["instance_id", "label_type", "input_type", "text"]
        :return:
        """
        if len(self.query(update_condition)) == 0:
            return False
        sql, v_tuple = prepare_update("labels", update_condition, modify_obj,
                                      ["label_id", "candidate_id", "series_id", "user_id", "file_id", "content"])
        cur = self.sql_connection.cursor()
        try:
            cur.execute(sql, v_tuple)
            self.sql_connection.commit()
        except Exception:
            self.sql_connection.rollback()
            return False

        return True

    def get_label(self, series_id, file_id):
        series_service = SeriesService(self.sql_connection)
        series = series_service.query({"series_id": series_id})
        if len(series) != 1:
            return None
        series = series[0]
        x_dim = int(series['x_dimension'])
        y_dim = int(series['y_dimension'])


        label = self.query({"series_id":series_id, "file_id":file_id})
        if len(label) == 0:
            return None
        content = eval(label[0]['content'])
        pixel_data = content['labelmap2D']['pixelData']

        pixel_data_xy = np.zeros((x_dim * y_dim))
        for label_data in pixel_data:
            label_int = int(float(label_data))
            # content_1D = np.reshape(pixel_data_xy, x_dim * y_dim)
            pixel_data_xy[pixel_data[label_data]] = label_int
        pixel_data_xy = np.reshape(pixel_data_xy, (x_dim, y_dim))
        return pixel_data_xy


    @staticmethod
    def compress_content(content):
        """
        Compress the sparse 1D array
        :param content:
        :return:
        """
        unique_key = np.unique(content).tolist()[1:]
        compressed = {}
        for i in unique_key:
            compressed[i] = np.where(content == i)[0].tolist()

        return compressed
