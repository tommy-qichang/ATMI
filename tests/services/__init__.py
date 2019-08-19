import os
from shutil import copyfile

from atmi_backend.services.InitialService import InitialService

tmp_path = ''


def setup_sql():
    # copy schema file to test folder.
    global tmp_path
    copyfile(os.path.join(InitialService.DATABASE_PATH, InitialService.SCHEMA_NAME),
             os.path.join('./tests/services/resources', InitialService.SCHEMA_NAME))

    tmp_path = InitialService.DATABASE_PATH
    InitialService.DATABASE_PATH = './tests/services/resources'
    # If database exist, remove to run the test.
    if os.path.exists(os.path.join(InitialService.DATABASE_PATH, InitialService.DATABASE_NAME)):
        os.remove(os.path.join(InitialService.DATABASE_PATH, InitialService.DATABASE_NAME))


def teardown_sql():
    ini_service = InitialService()
    ini_service.close_connection()
    if os.path.exists(os.path.join(InitialService.DATABASE_PATH, InitialService.DATABASE_NAME)):
        os.remove(os.path.join(InitialService.DATABASE_PATH, InitialService.DATABASE_NAME))
    if os.path.exists(os.path.join(InitialService.DATABASE_PATH, InitialService.SCHEMA_NAME)):
        os.remove(os.path.join(InitialService.DATABASE_PATH, InitialService.SCHEMA_NAME))
    InitialService.DATABASE_PATH = tmp_path
