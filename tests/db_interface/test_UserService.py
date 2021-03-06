from sqlite3 import Error

from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.UserService import UserService
from tests.db_interface import setup_sql, teardown_sql


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

        # email is a unique key, should just update record.
        result = user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        assert result is False

        cursor.execute("SELECT * from users")
        records = cursor.fetchall()
        assert len(records) == 1

    def test_queryUser(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        user_service = UserService(conn)

        # In case the record doesn't exist.
        try:
            user_service.insert("tommy.qichang@gmail.com", "qi chang", "**(SDFDSF", None, 0)
        except Error:
            pass
        result = user_service.query({"email": "tommy.qichang@gmail.com"})

        assert result[0]["email"] == "tommy.qichang@gmail.com"
        assert result[0]["name"] == "qi chang"
        assert "pwd" not in result[0]
        # assert result[0]["pwd"] == '**(SDFDSF'
        assert result[0]["init_code"] is None
        assert result[0]["user_type"] == 0

        result = user_service.query({"email": "not_exist@gmail.com"})
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
            user_result = user_service.query({'email': 'tommy.qichang@gmail.com'})
            assert user_result[0]['name'] == 'qi chang'
            assert 'pwd' not in user_result
            assert user_result[0]['init_code'] is None
            assert user_result[0]['user_type'] == 0

            user_result = user_service.query({'email': 'tommy.qichang@gmail.com', 'pwd': '**(SDFDSF'})
            assert user_result[0]['name'] == 'qi chang'
            assert 'pwd' not in user_result
            assert user_result[0]['init_code'] is None
            assert user_result[0]['user_type'] == 0

            user_result = user_service.query({'email': 'tommy.qichang@gmail.com', 'pwd': 'WrongPwd'})
            assert len(user_result) == 0

        except Error:
            pass
        result = user_service.update("tommy.qichang@gmail.com",
                                     {"name": "MK", "pwd": "pwdpwd", "init_code": "*&**I", "user_type": 1})
        assert result is True
        user_result = user_service.query({'email': 'tommy.qichang@gmail.com'})
        assert user_result[0]['name'] == 'MK'
        assert 'pwd' not in user_result
        assert user_result[0]['init_code'] == '*&**I'
        assert user_result[0]['user_type'] == 1

        user_result = user_service.query({'email': 'tommy.qichang@gmail.com', 'pwd': 'pwdpwd'})
        assert user_result[0]['name'] == 'MK'
        assert 'pwd' not in user_result
        assert user_result[0]['init_code'] == '*&**I'
        assert user_result[0]['user_type'] == 1

        user_result = user_service.query({'email': 'tommy.qichang@gmail.com', 'pwd': '**(SDFDSF'})
        assert len(user_result) == 0

        # not existing email will return False
        result = user_service.update("not_existy@gmail.com",
                                     {"name": "MK", "pwd": "***", "init_code": "*&**I", "user_type": 1})
        assert result is False

        # unqualified key will ignored.

        result = user_service.update("tommy.qichang@gmail.com",
                                     {"email": "not_exist@gmail.com", "name": "MK", "pwd": "***", "init_code": "*&**I",
                                      "user_type": 1})
        assert result is True
        result = user_service.query({"email": "not_exist@gmail.com"})
        assert len(result) == 1

    def test_hash_new_password(self):

        pw_hash = UserService.hash_new_password('Correctpassword')
        print(f"{pw_hash}")
        assert UserService.is_correct_password(pw_hash, "Correctpassword")
        assert not UserService.is_correct_password(pw_hash, "Wrongpassword")
        assert not UserService.is_correct_password(pw_hash, "")
