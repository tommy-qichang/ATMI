import sqlite3
from sqlite3 import Error
import os


class InitialService:
    DATABASE_PATH = './atmi_backend/db'
    SCHEMA_NAME = 'schema.sql'
    DATABASE_NAME = 'atmi_db'
    db_connection = None

    def get_connection(self):
        """
        singleton instance, will return connection, and will create one if it's not initialized.
        :return: db connection.
        """
        if InitialService.db_connection is None:
            InitialService.db_connection = self.initialize_database()

        return InitialService.db_connection

    def close_connection(self):
        """
        Close connection if not needed, and set db_connection as None.
        :return: True
        """
        if InitialService.db_connection is not None:
            InitialService.db_connection.commit()
            InitialService.db_connection.close()
            InitialService.db_connection = None
            return True

        return False

    def initialize_database(self):
        """
        Initialize database and setup tables structure.
        If the database already exists, return cursor without initial table structure.
        :return:
        conn: sqlite database connection object
        """

        try:
            conn = sqlite3.connect(os.path.join(InitialService.DATABASE_PATH, InitialService.DATABASE_NAME),
                                   check_same_thread=False)
            cur = conn.cursor()
            self.initialize_schema(cur)

            return conn
        except Error as e:
            # TODO: add log
            print(e)
            return None

    def initialize_schema(self, cursor):
        """
        Setup table structure
        :param cursor:
        :return: True if setup success.
        """
        with open(os.path.join(InitialService.DATABASE_PATH, InitialService.SCHEMA_NAME)) as fp:
            cursor.executescript(fp.read())

        return True

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
