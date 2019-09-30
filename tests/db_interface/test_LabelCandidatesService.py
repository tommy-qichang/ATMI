from sqlite3 import Error

from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.LabelCandidatesService import LabelCandidatesService
from tests.db_interface import setup_sql, teardown_sql


class TestLabelCandidatesService:

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

        labelcandidates_service = LabelCandidatesService(conn)

        insert_status = labelcandidates_service.insert(1, 0, None, "Ischemic Stroke")

        assert insert_status is False

        instance_service = InstanceService(conn)
        instance_service.insert("Stroke annotation", "CT", "description...", "./data/stroke_data", 0, 100, 10)
        last_rowid = instance_service.query({"name": "Stroke annotation"})[0]["instance_id"]

        insert_status = labelcandidates_service.insert(last_rowid, 0, None, "Ischemic Stroke")
        assert insert_status is True

    def test_query_one_record(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        instance_service = InstanceService(conn)

        labelcandidates_service = LabelCandidatesService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke annotation", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_data", 0, 50, 10)
        except Error:
            print(Error)
            pass
        last_rowid = instance_service.query({"name": "Stroke annotation"})[0]["instance_id"]
        labelcandidates_service.insert(last_rowid, 0, None, "Ischemic Stroke")
        result = labelcandidates_service.query({"instance_id": last_rowid})
        assert result[0]["text"] == "Ischemic Stroke"

    def test_delete(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        # In case the record doesn't exist.
        try:
            instance_service.insert("Stroke Annotation-del1", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-del1", 0, 50, 10)
        except Error:
            pass

        last_rowid = instance_service.query({"name": "Stroke Annotation-del1"})[0]["instance_id"]

        labelcandidates_service = LabelCandidatesService(conn)
        labelcandidates_service.insert(last_rowid, 0, None, "Ischemic Stroke")
        candidate_id = labelcandidates_service.query({"text": "Ischemic Stroke", "instance_id": last_rowid})[0][
            "candidate_id"]

        status = labelcandidates_service.delete({"candidate_id": candidate_id})
        assert status is True

        labelcandidates_service.insert(last_rowid, 0, None, "Ischemic Stroke")
        candidate_id = labelcandidates_service.query({"text": "Ischemic Stroke", "instance_id": last_rowid})

        status = labelcandidates_service.delete({"text": "Ischemic Stroke", "instance_id": last_rowid})
        assert status is True

        status = labelcandidates_service.delete({"text": "Ischemic Stroke", "instance_id": last_rowid})
        assert status is False

    def test_update(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        try:
            instance_service.insert("Stroke Annotation-update1", "CT", "Stroke annotation descriptions.",
                                    "./data/stroke_instance-update1", 0, 50, 10)
        except Error:
            pass

        last_rowid = instance_service.query({"name": "Stroke Annotation-update1"})[0]["instance_id"]

        labelcandidates_service = LabelCandidatesService(conn)
        labelcandidates_service.insert(last_rowid, 0, None, "Ischemic Stroke-update1")

        status = labelcandidates_service.update({"instance_id": last_rowid},
                                                {"text": "Ischemic Stroke-update2", "label_type": 1})
        update_item = labelcandidates_service.query({"instance_id": last_rowid})
        assert status is True
        assert update_item[0]["text"] == "Ischemic Stroke-update2"

        status = labelcandidates_service.update({"instance_id": 1000},
                                                {"text": "Ischemic Stroke-update2", "label_type": 1})
        assert status is False
