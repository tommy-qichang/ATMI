import sqlite3

from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update


class UserService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if the user exist
        :param email:
        :return: None|User_Obj
        """

        sql = prepare_query("users", query_obj,
                            ['user_id', 'email', 'name', 'pwd', 'init_code', 'user_type'])

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        user = cur.fetchall()
        user = [dict(item) for item in user]

        return user

    def insert(self, email, name, pwd, init_code, user_type):
        """
        Insert user record, and return True if succeed, otherwise False.
        :param email: Unique email id.
        :param name:
        :param pwd:
        :param init_code:
        :param user_type:
        :return:True|False
        """
        if len(self.query({"email": email})) != 0:
            return False
        cur = self.sql_connection.cursor()

        sql, v = prepare_insert("users", {"name": name, "email": email, "pwd": pwd, "init_code": init_code,
                                          "user_type": user_type})
        cur.execute(sql, v)
        self.sql_connection.commit()
        return True

    def delete(self, email):
        """
        Delete user by the email account.
        :param email:
        :return: True if the user exist. False if not.
        """
        if len(self.query({"email": email})) == 0:
            return False
        cur = self.sql_connection.cursor()
        sql = prepare_delete("users", {'email': email})

        cur.execute(sql)
        self.sql_connection.commit()

        return True

    def update(self, email, modify_obj):
        """
        Modify user by the email account.
        :param email:
        :param modify_obj: modify object, keys are all optional. { name:?, pwd:? init_code:? user_type:?}
        :return:
        """

        if len(self.query({"email": email})) == 0:
            return False
        sql, v_list = prepare_update("users", {"email": email}, modify_obj,
                                     ['user_id', 'email', 'name', 'pwd', 'init_code', 'user_type'])
        cur = self.sql_connection.cursor()
        cur.execute(sql, v_list)
        return True
