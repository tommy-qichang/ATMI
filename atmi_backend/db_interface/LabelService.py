import sqlite3

import numpy as np

from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class LabelService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

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
            record['content'] = record['content'].decode('utf-8')
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
        if has_record:
            self.update({"series_id": series_id, "user_id": user_id, "file_id": file_id},
                        {"content": content})
        else:
            sql, v = prepare_insert("labels",
                                    {"series_id": series_id, "user_id": user_id,
                                     "file_id": file_id, "content": content})
            cur.execute(sql, v)
            # print(f"Insert labels without commit!")
            self.sql_connection.commit()
        return True

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
        cur.execute(sql, v_tuple)

        # print(f"Insert labels without commit!")
        self.sql_connection.commit()
        return True

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
