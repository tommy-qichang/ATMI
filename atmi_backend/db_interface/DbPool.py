import logging
import os
import sqlite3
from queue import Queue

log = logging.getLogger(__name__)

class DbPool:

    DATABASE_PATH = './atmi_backend/db'
    DATABASE_NAME = 'atmi_db'
    SCHEMA_NAME = 'schema.sql'

    def __init__(self, count=20, auto_get=True):
        db_queue = Queue(count)
        for i in range(count):
            db = self.get_db_instance()
            db_queue.put(db)

        self._queue = db_queue
        self.item = self._queue.get() if auto_get else None

    def __enter__(self):
        if self.item is None:
            self.item = self._queue.get()
        return self.item

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.item is not None:
            self._queue.put(self.item)
            self.item = None

    def __del__(self):
        if self.item is not None:
            self._queue.put(self.item)
            self.item = None


    def get_db_instance(self):
        """
        Initialize database and setup tables structure.
        If the database already exists, return cursor without initial table structure.
        :return:
        conn: sqlite database connection object
        """
        setup_schema = False
        if not os.path.isfile(os.path.join(self.DATABASE_PATH, self.DATABASE_NAME)):
            setup_schema = True
        try:
            conn = sqlite3.connect(os.path.join(self.DATABASE_PATH, self.DATABASE_NAME),
                                   check_same_thread=False)
            if setup_schema:
                cursor = conn.cursor()
                with open(os.path.join(self.DATABASE_PATH, self.SCHEMA_NAME)) as fp:
                    cursor.executescript(fp.read())

            return conn
        except sqlite3.Error as e:
            # TODO: add log
            log.warning(e)
            return None


# if __name__ == '__main__':
#
#     db_pool = DbPool(count=3)
#
#     with db_pool as db:
#
#         print(db)
#
#     for i in range(10):
#
#         with db_pool as db:
#             print(f"40->{i}")
#             print(db)