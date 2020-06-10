import sqlite3
from sqlite3 import Error
import os

from atmi_backend.db_interface.DbPool import DbPool

db_pool = None

class InitialService:


    def __init__(self, pool_num=20):
        global db_pool
        if db_pool is None:
            db_pool = DbPool(count=pool_num)

    def get_connection(self):
        """
        singleton instance, will return connection, and will create one if it's not initialized.
        :return: db connection.
        """
        with db_pool as conn:
            return conn


    def has_records(self):
        """
        Check if the database is blank or in used.
        :return: True - if exist
        """

        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute('select * from users')
        users = cur.fetchall()
        if len(users) == 0:
            return False
        else:
            return True
