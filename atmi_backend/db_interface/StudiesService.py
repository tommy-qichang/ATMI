import sqlite3

from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class StudiesService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if record exist by query_obj.
        :param query_obj:
        :return: None or record object.
        """

        sql = prepare_query("studies", query_obj,
                            ['study_id', 'instance_id', 'folder_name', 'total_files_number', 'annotators', 'auditors'])
        cur = self.sql_connection.cursor()
        cur.execute(sql)
        result = cur.fetchall()
        result = [dict(item) for item in result]
        return result

    def insert(self, instance_id, folder_name, total_files_number):
        """
        Insert record for new instance.
        :param instance_id:
        :param folder_name:
        :param total_files_number:
        :return:
        """

        if len(self.query({"instance_id": instance_id, "folder_name": folder_name})) != 0:
            return False
        cur = self.sql_connection.cursor()

        sql, v = prepare_insert("studies", {"instance_id": instance_id, "folder_name": folder_name,
                                            "total_files_number": total_files_number, "status": 1})
        cur.execute(sql, v)
        self.sql_connection.commit()
        return True

    def delete(self, del_condition):
        """
        Delete studies by the del_condition: {study_id:''} or {instance_id:'', folder_name:''}
        :param
        :return: True if the user exist. False if not.
        """
        if len(self.query(del_condition)) == 0:
            return False
        sql = prepare_delete("studies", del_condition,
                             ['study_id', 'instance_id', 'folder_name', 'total_files_number', 'annotators', 'auditors'])

        cur = self.sql_connection.cursor()

        cur.execute(sql)
        self.sql_connection.commit()
        return True

    def update(self, update_condition, modify_obj):
        """
        Modify studies by the name or data_path .
        :param update_condition: {study_id:''} or {instance_id:'', folder_name:''}
        :param modify_obj: modify object, keys are all optional. ['study_id', 'instance_id', 'folder_name', 'total_files_number', 'annotators', 'auditors']
        :return:
        """
        if len(self.query(update_condition)) == 0:
            return False
        sql, v_tuple = prepare_update("studies", update_condition, modify_obj,
                                      ['study_id', 'instance_id', 'folder_name', 'total_files_number', 'annotators',
                                       'auditors'])
        cur = self.sql_connection.cursor()

        cur.execute(sql, v_tuple)
        self.sql_connection.commit()
        return True

    def add_users_in_study(self, study_id, annotator_id_list, auditor_id_list):
        """
        Add users who annotate the given study
        :return:
        """

    def delete_user_in_study(self, study_id, user_id, user_type):
        """
        delete user for one study.
        :param study_id:
        :param user_id:
        :param user_type:
        :return:
        """
