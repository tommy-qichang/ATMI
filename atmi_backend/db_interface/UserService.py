import hashlib
import hmac
import os
import sqlite3

from flask import Flask
from atmi_backend.db_interface.utils import prepare_query, prepare_insert, prepare_delete, prepare_update

app = Flask("atmi.app")


class UserService:

    def __init__(self, connection):
        self.sql_connection = connection
        self.sql_connection.row_factory = sqlite3.Row

    def query(self, query_obj):
        """
        Check if the user exist
        :param query_obj:
        :return: None|User_Obj
        """
        orig_pwd: str = ""
        if "pwd" in query_obj:
            # Need to transfer pwd to encrypted.
            orig_pwd = query_obj['pwd']
            del query_obj['pwd']

        sql = prepare_query("users", query_obj,
                            ['user_id', 'email', 'name', 'init_code', 'user_type'])

        cur = self.sql_connection.cursor()
        cur.execute(sql)
        user = cur.fetchall()
        user = [dict(item) for item in user]

        if len(user) > 0 and orig_pwd != "":
            user = user[0]
            encryp_pwd = user['pwd']
            is_correct_pwd = UserService.is_correct_password(encryp_pwd, orig_pwd)
            if is_correct_pwd:
                del user['pwd']
                return [user]
            return []
        if len(user) > 0:
            app.logger.debug(f"user exist: {user}")
            for i in user:
                del i['pwd']

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
            # self.update(email, {'name': name, 'pwd': pwd, 'init_code': init_code, 'user_type': user_type})
            return False
        cur = self.sql_connection.cursor()

        crypted_pwd = UserService.hash_new_password(pwd)
        sql, v = prepare_insert("users", {"name": name, "email": email, "pwd": crypted_pwd, "init_code": init_code,
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
        if 'pwd' in modify_obj:
            crypted_pwd = UserService.hash_new_password(modify_obj['pwd'])
            modify_obj['pwd'] = crypted_pwd
            app.logger.debug(f"Update user:{email}, with modify_obj:{modify_obj}")
        sql, v_list = prepare_update("users", {"email": email}, modify_obj,
                                     ['user_id', 'email', 'name', 'pwd', 'init_code', 'user_type'])

        app.logger.debug(f"sql:{sql}, value list:{v_list}")
        cur = self.sql_connection.cursor()
        cur.execute(sql, v_list)
        self.sql_connection.commit()
        # # debug:
        # self.query({'email': email})
        return True

    @staticmethod
    def hash_new_password(password: str) -> str:
        """
        Hash the provided password with a randomly-generated salt and return the
        salt and hash to store in the database.
        """
        salt = os.urandom(16)
        pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return str(salt) + "$$$" + str(pw_hash)

    @staticmethod
    def is_correct_password(stored_pwd: str, password: str) -> bool:
        """
        Given a previously-stored salt and hash, and a password provided by a user
        trying to log in, check whether the password is correct.
        """
        stored_pwd = stored_pwd.split("$$$")
        if len(stored_pwd) < 2:
            return False
        salt = eval(stored_pwd[0])
        pw_hash = eval(stored_pwd[1])
        # salt = bytes([salt])
        # pw_hash = bytes([pw_hash])
        return hmac.compare_digest(
            pw_hash,
            hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        )
