from sqlite3 import Error

from atmi_backend.services.InitialService import InitialService
from atmi_backend.services.InstanceService import InstanceService
from atmi_backend.services.UserService import UserService
from tests.services import setup_sql, teardown_sql


class TestInstanceService:

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

    def test_create(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        cursor = conn.cursor()

        instance_service = InstanceService(conn)

        # query_mock = mocker.patch.object(instance_service, "query", return_value=None)
        insert_status = instance_service.insert("Stroke Annotation", "CT", "Stroke annotation descriptions.",
                                                "./data/stroke_instance",
                                                0, 50)

        # assert query_mock.called
        # assert query_mock.call_count == 2
        assert insert_status is True

        cursor.execute("SELECT * from instances")
        records = cursor.fetchall()
        assert len(records) == 1

        # name is a unique key, should not insert two times.
        result = instance_service.insert("Stroke Annotation", "CT2", "Stroke annotation descriptions2.",
                                         "./data/stroke_instance2",
                                         0, 50)
        assert result is False

        # data_path is a unique key, should not insert two times.
        result = instance_service.insert("Stroke Annotation2", "CT2", "Stroke annotation descriptions2.",
                                         "./data/stroke_instance",
                                         0, 50)
        assert result is False

    def test_query_one_record(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke Annotation", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance", 0, 50)
        except Error:
            print(Error)
            pass

        result = instance_service.query({'name': 'Stroke Annotation'})
        assert len(result) == 1
        assert result[0][2] == "CT"

        result = instance_service.query({'name': 'Stroke Annotation', 'data_path': './data/stroke_instance'})
        assert len(result) == 1
        assert result[0][2] == "CT"

    def test_query_multiple_record(self):

        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke Annotation2", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance2", 0, 50)
            instance_service.insert("Stroke Annotation3", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance3", 0, 50)
        except Error:
            pass

        result = instance_service.query({'name': 'Stroke Annotation2'})
        assert len(result) == 1
        assert result[0][1] == "Stroke Annotation2"

        result = instance_service.query({'modality': 'CT'})
        assert len(result) == 3
        assert result[0][1] == "Stroke Annotation"
        assert result[1][1] == "Stroke Annotation2"

    def test_query_none_record(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        result = instance_service.query({'name': 'None Record'})
        assert len(result) == 0

    def test_delete(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke Annotation-del1", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-del1", 0, 50)
            instance_service.insert("Stroke Annotation-del2", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-del2", 0, 50)
        except Error:
            pass
        result = instance_service.delete({"name": "Stroke Annotation-del1"})
        assert result is True

        result = instance_service.delete({"data_path": "./data/stroke_instance-del2"})
        assert result is True

        result = instance_service.delete({"data_path": "not_exist_path"})
        assert result is False

    def test_update(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        result = instance_service.update({"name": "Stroke Annotation"},
                                         {"modality": "MRI", "data_path": "./update_path", "has_audit": 1,
                                          "study_number": 100})
        assert result is True

        result = instance_service.update({"name": "Stroke Annotation_non_exist_record"},
                                         {"modality": "MRI", "data_path": "./update_path", "has_audit": 1,
                                          "study_number": 100})

        assert result is False

        result = instance_service.query({"name": "Stroke Annotation"})
        assert result[0][2] == "MRI"

    def test_list_users_in_instance(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        user_service = UserService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke Annotation-user", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-user", 0, 50)
            instance_service.insert("Stroke Annotation-user2", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-user2", 0, 50)
            user_service.insert("tommy.qichang@gmail.com", "qi chang", "*HGE&EF#", "", 1)
            user_service.insert("mk@gmail.com", "Michael Jackson", "*HGE&EF#", "", 0)
            user_service.insert("mozart@gmail.com", "Mozart", "*HGE&EF#", "", 0)

        except Error:
            pass

        instance_id_1 = instance_service.query({"name": "Stroke Annotation-user"})[0][0]
        instance_id_2 = instance_service.query({"name": "Stroke Annotation-user2"})[0][0]

        user_id_1 = user_service.query("tommy.qichang@gmail.com")[0][0]
        user_id_2 = user_service.query("mk@gmail.com")[0][0]
        user_id_3 = user_service.query("mozart@gmail.com")[0][0]

        instance_service.insert_user_in_instance(instance_id_1, user_id_1, 1)
        instance_service.insert_user_in_instance(instance_id_1, user_id_2, 0)
        instance_service.insert_user_in_instance(instance_id_2, user_id_3, 0)

        users = instance_service.list_users_in_instance(instance_id_1)
        assert users[0][0] == user_id_1
        assert users[1][0] == user_id_2
        users = instance_service.list_users_in_instance(instance_id_2)
        assert users[0][0] == user_id_3

    def test_delete_users_in_instance(self):

        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        user_service = UserService(conn)
        instance_id_1 = instance_service.query({"name": "Stroke Annotation-user"})[0][0]
        instance_id_2 = instance_service.query({"name": "Stroke Annotation-user2"})[0][0]

        user_id_1 = user_service.query("tommy.qichang@gmail.com")[0][0]
        user_id_2 = user_service.query("mk@gmail.com")[0][0]
        user_id_3 = user_service.query("mozart@gmail.com")[0][0]

        result = instance_service.delete_users_in_instance(instance_id_1, user_id_1)
        assert result is True
        result = instance_service.list_users_in_instance(instance_id_1)
        assert result[0][0] == user_id_2
        assert len(result) == 1

        result = instance_service.delete_users_in_instance(instance_id_2, user_id_3)
        assert result is True
        result = instance_service.list_users_in_instance(instance_id_2)
        assert len(result) == 0
