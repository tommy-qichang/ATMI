from atmi_backend.services.utils import gen_multiple_condition, prepare_delete, prepare_insert, prepare_update, \
    prepare_query
from tests.services import setup_sql, teardown_sql


class TestUtils:

    def setup_class(self):
        print("Setup Testing Environment....")
        setup_sql()

    def teardown_class(self):
        print("Delete Testing TEMP Files....")
        # Remove database and schema files
        teardown_sql()

    def setup_method(self, test_method):
        pass

    def teardown_method(self, test_method):
        pass

    def test_gen_multiple_condition(self):
        sql = gen_multiple_condition({"k1": "v1", "k2": "v2"}, ['k1', 'k2'])
        assert sql == 'k1="v1" and k2="v2"'
        sql = gen_multiple_condition({"k1": "v1", "k2": "v2"}, ['k1'])
        assert sql == 'k1="v1"'
        sql = gen_multiple_condition({"k1": "v1", "k2": "v2"}, ['k1', 'k2', 'k3'])
        assert sql == 'k1="v1" and k2="v2"'
        sql = gen_multiple_condition({"k1": "v1"}, ['k1', 'k2'])
        assert sql == 'k1="v1"'
        sql = gen_multiple_condition({}, ['k1', 'k2'])
        assert sql == ''
        sql = gen_multiple_condition({"k1": "v1", "k2": "v2"})
        assert sql == 'k1="v1" and k2="v2"'
        sql = gen_multiple_condition({"k1": 100012, "k2": "v2"}, ['k1', 'k2', 'k3'])
        assert sql == 'k1="100012" and k2="v2"'

    def test_prepare_query(self):
        sql = prepare_query("users", {"k1": "tommy", "k2": "d@gm.com"}, ["k1", "k2", "k3"])
        assert sql == 'SELECT * FROM users WHERE (k1="tommy" and k2="d@gm.com")'
        sql = prepare_query("users", {"k1": "tommy", "k2": "d@gm.com"})
        assert sql == 'SELECT * FROM users WHERE (k1="tommy" and k2="d@gm.com")'

    def test_prepare_insert(self):
        sql, sql_tuple = prepare_insert("users", {"k1": "tommy", "k2": "d@gm.com"}, ["k1", "k2", "k3"])
        assert sql == 'INSERT INTO users(k1 , k2) VALUES (? , ?)'
        assert sql_tuple == ("tommy", "d@gm.com")

        sql, sql_tuple = prepare_insert("users", {"k1": "tommy", "k2": "d@gm.com"}, ["k1"])
        assert sql == 'INSERT INTO users(k1) VALUES (?)'
        assert sql_tuple == ("tommy",)

        sql, sql_tuple = prepare_insert("users", {"k1": "tommy", "k2": "d@gm.com", "k3": 1000})
        assert sql == 'INSERT INTO users(k1 , k2 , k3) VALUES (? , ? , ?)'
        assert sql_tuple == ("tommy", "d@gm.com", 1000)

    def test_prepare_delete(self):
        sql = prepare_delete("users", {"k1": "tommy", "k2": "d@gm.com"}, ["k1", "k2", "k3"])
        assert sql == 'DELETE FROM users WHERE (k1="tommy" and k2="d@gm.com")'

    def test_prepare_update(self):
        sql, sql_tuple = prepare_update("users", {"email": "tommy.qichang@gmail.com"}, {"k1": "v1", "k2": "v2"},
                                        ["k1", "k2", "k3"])
        assert sql == 'UPDATE users SET k1 = ?,k2 = ? WHERE email = ?'
        assert sql_tuple == ("v1", "v2", "tommy.qichang@gmail.com")

        sql, sql_tuple = prepare_update("users", {"email": "tommy.qichang@gmail.com", "q1": 1000},
                                        {"k1": "v1", "k2": "v2"}, ["k1"])
        assert sql == 'UPDATE users SET k1 = ? WHERE email = ? and q1 = ?'
        assert sql_tuple == ("v1", "tommy.qichang@gmail.com", 1000)
