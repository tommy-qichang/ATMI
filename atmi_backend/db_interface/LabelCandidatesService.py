import sqlite3

from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class LabelCandidatesService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if record exist by query_obj.
        :param query_obj:
        :return: None or record object.
        """

        sql = prepare_query("label_candidates", query_obj,
                            ["candidate_id", "instance_id", "label_type", "input_type", "text"])
        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]
        return result

    def insert(self, instance_id, label_type, input_type, text):
        """
        Insert new record for LabelCandidates.
        :param instance_id:
        :param label_type:
        :param input_type:
        :param text:
        :return:
        """

        instance_service = InstanceService(self.sql_connection)

        if len(instance_service.query({"instance_id": instance_id})) == 0:
            # There is no such instance ID.
            return False

        cur = self.sql_connection.cursor()
        sql, v = prepare_insert("label_candidates",
                                {"instance_id": instance_id, "label_type": label_type, "input_type": input_type,
                                 "text": text})
        cur.execute(sql, v)
        # self.sql_connection.commit()
        return True

    def delete(self, del_condition):
        """
        Delete instance by the del_condition: {instance_id:''} or {candidate_id:''}
        :param
        :return: True if the user exist. False if not.
        """
        if len(self.query(del_condition)) == 0:
            return False
        sql = prepare_delete("label_candidates", del_condition,
                             ["candidate_id", "instance_id", "label_type", "input_type", "text"])

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        # self.sql_connection.commit()
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
        sql, v_tuple = prepare_update("label_candidates", update_condition, modify_obj,
                                      ["candidate_id", "instance_id", "label_type", "input_type", "text"])
        cur = self.sql_connection.cursor()
        cur.execute(sql, v_tuple)
        # self.sql_connection.commit()
        return True
