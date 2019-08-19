from sqlite3 import Error

from atmi_backend.services.InitialService import InitialService
from atmi_backend.services.UserService import UserService
from tests.services import setup_sql, teardown_sql


class TestUserService:

    def setup_class(self):
        print("Setup Testing Environment....")
        setup_sql()

    def teardown_class(self):
        print("Delete Testing TEMP Files....")
        teardown_sql()

    def setup_method(self, test_method):
        pass

    def teardown_method(self, test_method):
        pass

    def test_createUser(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        cursor = conn.cursor()

        user_service = UserService(conn)
        user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)

        cursor.execute("SELECT * from users")
        records = cursor.fetchall()
        assert len(records) == 1

        # email is a unique key, should not insert two times.
        result = user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        assert result is False

    def test_queryUser(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        user_service = UserService(conn)

        # In case the record doesn't exist.
        try:
            user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        except Error:
            pass
        result = user_service.query("tommy.qichang@gmail.com")

        assert result[0][2] == "tommy.qichang@gmail.com"
        assert result[0][1] == "qi chang"
        assert result[0][3] == '**(SDFDSF'
        assert result[0][4] is None
        assert result[0][5] == 0

        result = user_service.query("not_exist@gmail.com")
        assert len(result) == 0

    def test_deleteUser(self):

        ini_service = InitialService()
        conn = ini_service.get_connection()
        user_service = UserService(conn)
        # In case the record doesn't exist.
        try:
            user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        except Error:
            pass
        result = user_service.delete("tommy.qichang@gmail.com")
        assert result is True

        result = user_service.delete("tommy.qichang@gmail.com")
        assert result is False

    def test_updateUser(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        user_service = UserService(conn)
        try:
            user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        except Error:
            pass
        result = user_service.update("tommy.qichang@gmail.com",
                                     {"name": "MK", "pwd": "***", "init_code": "*&**I", "user_type": 1})
        assert result is True

        # not existing email will return False
        result = user_service.update("not_existy@gmail.com",
                                     {"name": "MK", "pwd": "***", "init_code": "*&**I", "user_type": 1})
        assert result is False

        # unqualified key will ignored.

        result = user_service.update("tommy.qichang@gmail.com",
                                     {"email": "not_exist@gmail.com", "name": "MK", "pwd": "***", "init_code": "*&**I",
                                      "user_type": 1})
        assert result is True
        result = user_service.query("not_exist@gmail.com")
        assert len(result) == 1
