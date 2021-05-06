import sqlite3

from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class InstanceService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if record exist by query_obj.
        :param query_obj:
        :return: None or record object.
        """

        sql = prepare_query("instances", query_obj,
                            ['instance_id', 'name', 'modality', 'description', 'data_path', 'has_audit',
                             'study_num', 'annotated_num', 'status'])
        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]
        return result

    def insert(self, name, modality, description, data_path, has_audit, study_num, annotated_num, status):
        """
        Insert record for new instance.
        :param name:
        :param modality:
        :param description:
        :param data_path:
        :param has_audit:
        :param study_num:
        :param annotated_num:
        :param status: 0:initialized, 1:importing, 2: annotating, 3:finished
        :return: True if insert success.
        """
        if len(self.query({"name": name})) != 0:
            return -1
        cur = self.sql_connection.cursor()

        sql, v = prepare_insert("instances",
                                {"name": name, "modality": modality, "description": description, "data_path": data_path,
                                 "has_audit": has_audit, "study_num": study_num, "annotated_num": annotated_num,
                                 "status": status})
        cur.execute(sql, v)
        self.sql_connection.commit()
        return cur.lastrowid

    def delete(self, del_condition):
        """
        Delete instance by the del_condition: {name:''} or {data_path:''}
        :param
        :return: True if the user exist. False if not.
        """
        if len(self.query(del_condition)) == 0:
            return False
        sql = prepare_delete("instances", del_condition,
                             ['instance_id', 'name', 'modality', 'description', 'data_path', 'has_audit',
                              'study_num', 'annotated_num', 'status'])

        cur = self.sql_connection.cursor()

        cur.execute(sql)
        self.sql_connection.commit()
        return True

    def update(self, update_condition, modify_obj):
        """
        Modify user by the name or data_path .
        :param update_condition: {name:''} or {data_path:''}
        :param modify_obj: modify object, keys are all optional. ['name', 'modality', 'description', 'data_path', 'has_audit', 'study_num', 'annotated_num']
        :return:
        """
        if len(self.query(update_condition)) == 0:
            return False
        sql, v_tuple = prepare_update("instances", update_condition, modify_obj,
                                      ['instance_id', 'name', 'modality', 'description', 'data_path', 'has_audit',
                                       'study_num', 'annotated_num', "status"])
        cur = self.sql_connection.cursor()

        cur.execute(sql, v_tuple)
        self.sql_connection.commit()
        return True

    def list_users_in_instance(self, instance_id):
        """
        List all users belongs to instance_id instance.
        :param instance_id:
        :return:
        """
        sql = prepare_query("instances_users", {"instance_id": instance_id})

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]
        self.sql_connection.commit()
        return result

    def insert_user_in_instance(self, instance_id, user_id, is_auditor):
        """
        Insert users given instance_id for instances_users table.
        :param instance_id
        :param user_id:
        :param is_auditor:
        :return:
        """

        sql, k_list = prepare_insert("instances_users",
                                     {"user_id": user_id, "instance_id": instance_id, "is_auditor": is_auditor})

        cur = self.sql_connection.cursor()
        cur.execute(sql, k_list)
        self.sql_connection.commit()
        return True

    def delete_users_in_instance(self, instance_id, user_id):
        """
        Delete users in current instance
        :param instance_id:
        :param user_id_list:
        :return:
        """

        sql = prepare_delete("instances_users", {"instance_id": instance_id, "user_id": user_id})

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        self.sql_connection.commit()
        return True

    def delete_all_users_in_instance(self, instance_id):
        """
        Delete all users in current instance
        :param instance_id:
        :return:
        """

        sql = prepare_delete("instances_users", {"instance_id": instance_id})

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        self.sql_connection.commit()
        return True
