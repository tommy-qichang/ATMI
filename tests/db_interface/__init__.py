import os
from shutil import copyfile

from atmi_backend.db_interface.DbPool import DbPool
import atmi_backend.db_interface.InitialService as InitialService

tmp_path = ''


def setup_sql():
    # copy schema file to test folder.
    global tmp_path
    copyfile(os.path.join(DbPool.DATABASE_PATH, DbPool.SCHEMA_NAME),
             os.path.join('./tests/db_interface/resources', DbPool.SCHEMA_NAME))

    tmp_path = DbPool.DATABASE_PATH
    DbPool.DATABASE_PATH = './tests/db_interface/resources'
    # If database exist, remove to run the test.
    if os.path.exists(os.path.join(DbPool.DATABASE_PATH, DbPool.DATABASE_NAME)):
        os.remove(os.path.join(DbPool.DATABASE_PATH, DbPool.DATABASE_NAME))


def teardown_sql():

    if InitialService.db_pool:
        InitialService.db_pool = None

    # ini_service = InitialService()
    # ini_service.close_connection()

    if os.path.exists(os.path.join(DbPool.DATABASE_PATH, DbPool.DATABASE_NAME)):
        os.remove(os.path.join(DbPool.DATABASE_PATH, DbPool.DATABASE_NAME))
    if os.path.exists(os.path.join(DbPool.DATABASE_PATH, DbPool.SCHEMA_NAME)):
        os.remove(os.path.join(DbPool.DATABASE_PATH, DbPool.SCHEMA_NAME))
    DbPool.DATABASE_PATH = tmp_path
