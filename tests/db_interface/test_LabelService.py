import os

import numpy as np

from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.LabelService import LabelService
from tests.db_interface import setup_sql, teardown_sql


class TestLabelCandidatesService:

    def setup_class(self):
        print("Setup Testing Environment....")
        setup_sql()
        qry = open(os.path.join(InitialService.DATABASE_PATH, "mock_data.sql"), 'r').read()

        ini_service = InitialService()
        conn = ini_service.get_connection()
        cur = conn.cursor()
        cur.executescript(qry)
        conn.commit()

    def teardown_class(self):
        print("Delete Testing TEMP Files....")
        teardown_sql()

    def setup_method(self, test_method):
        pass

    def teardown_method(self, test_method):
        pass

    def test_query_and_create(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        label_service = LabelService(conn)
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert len(label_result) == 0
        insert_status = label_service.insert(1, 1, "2_DCM.dcm", "content_data_232rwer2r232erwer2r")
        assert insert_status is True
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert len(label_result) == 1

        insert_status = label_service.insert(1, 1, "2_DCM.dcm", "content_data2222222_232rwer2r232erwer2r")
        assert insert_status is True
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert len(label_result) == 1
        assert label_result[0]["content"] == "content_data2222222_232rwer2r232erwer2r"

        insert_status = label_service.insert(1, 1, "3_DCM.dcm", "content_data3333_232rwer2r232erwer2r")
        assert insert_status is True
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "3_DCM.dcm"})
        assert len(label_result) == 1
        assert label_result[0]["series_id"] == 1
        assert label_result[0]["user_id"] == 1
        assert label_result[0]["file_id"] == "3_DCM.dcm"
        assert label_result[0]["content"] == "content_data3333_232rwer2r232erwer2r"

    def test_update(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        label_service = LabelService(conn)
        status = label_service.update({"series_id": 1, "user_id": 1, "file_id": "not_exist_DCM.dcm"},
                                      {"content": "asf"})
        assert status is False

        status = label_service.update({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"},
                                      {"content": "asf"})
        assert status is True

    def test_delete(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        label_service = LabelService(conn)

        status = label_service.delete({"series_id": 1, "user_id": 1, "file_id": "not_exist_DCM.dcm"})
        assert status is False

        label_service.insert(1, 1, "2_DCM.dcm", "content_data_232rwer2r232erwer2r")
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert len(label_result) == 1
        status = label_service.delete({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert status is True
        label_result = label_service.query({"series_id": 1, "user_id": 1, "file_id": "2_DCM.dcm"})
        assert len(label_result) == 0

    def test_compress_content(self):
        testdata = np.array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0])
        result1 = LabelService.compress_content(testdata)
        assert result1[1] == [8, 9, 12, 13]
        testdata = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0])
        result1 = LabelService.compress_content(testdata)
        assert result1[1] == [13]
        testdata = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        result1 = LabelService.compress_content(testdata)
        assert result1 == {}
        testdata = np.array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
        result1 = LabelService.compress_content(testdata)
        assert result1[1] == [0, 19]

        testdata = np.array([0, 0, 0, 2, 2, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 10])
        result1 = LabelService.compress_content(testdata)
        assert result1[1] == [8, 9, 12, 13]
        assert result1[2] == [3, 4]
        assert result1[10] == [19]
