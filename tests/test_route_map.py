import json

from flask import url_for

from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.LabelCandidatesService import LabelCandidatesService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.StudiesService import StudiesService
from atmi_backend.db_interface.UserService import UserService
from tests.db_interface import setup_sql, teardown_sql


class TestRouteMap:

    def setup_class(self):
        print("Setup Testing Environment....")
        setup_sql()

    def teardown_class(self):
        print("Delete Testing Files....")
        # Remove database and schema files
        teardown_sql()

    def setup_method(self, test_method):
        pass

    def teardown_method(self, test_method):
        pass

    def test_ini(self, client):
        ini = client.get(url_for("init", init_code='invalid_ini_code_sdfsad6324234df'))
        # No existing record, so setup the system.
        assert ini.json == ["", "", 0]
        assert ini.status == '200 OK'

        ini_service = InitialService()
        conn = ini_service.get_connection()
        user_service = UserService(conn)
        user_service.insert("tommy.qichang@gmail.com", "qi chang", "ASDF#$#!!@$!123", "sdfsad6324234df", 0)
        user_service.insert("huafu@gmail.com", "hua fu", "ASDF#$#!!@$!123", "12345678", 0)

        ini = client.get(url_for("init", init_code='invalid_ini_code_sdfsad6324234df'))
        assert ini.json == []
        assert ini.status == '200 OK'

        ini = client.get(url_for("init", init_code='sdfsad6324234df'))

        assert ini.json[0] == "qi chang"
        assert ini.json[1] == "tommy.qichang@gmail.com"
        assert ini.status == '200 OK'

    def test_workbench_page(self, client):
        res = client.get(url_for('workbench', instance_id=3, study_id=3, series_id=1))
        assert res.status == '200 OK'
        assert res.data.decode("utf-8").find("<title>404</title>") > 0

    def test_list_all_studies(self, client):
        res = client.get(url_for('list_all_studies', instance_id=1))
        assert res.json == {}
        assert res.status == '200 OK'

        # Setup studies sample data
        ini_service = InitialService()
        conn = ini_service.get_connection()
        instance_service = InstanceService(conn)
        instance_service.insert("Stroke Annotation Task", "CT", "The stroke CT scans for annotation tasks.",
                                "tests/services/sample_data", 0, 200, 1, 0)
        result = instance_service.query({})
        assert result[0]["instance_id"] == 1
        assert result[0]["name"] == "Stroke Annotation Task"

        studies_service = StudiesService(conn)
        studies_service.insert(1, "Dicom_691_2", 25, 0, "folder", 100,1)
        studies_service.insert(1, "Raw_1003/3CH_tagging", 30, 1, "folder", 100,1)

        series_service = SeriesService(conn)
        series_service.insert(1, "series1", "series1/path", ["1"], 1, "200", "200", "0.5", "0.5", "0.5", 512, 512, 512,
                              1, 100101, "", "", "")
        series_service.insert(1, "series2", "series2/path", ["1"], 1, "200", "200", "0.5", "0.5", "0.5", 512, 512, 512,
                              1, 100101, "", "", "")
        series_service.insert(2, "series3", "series3/path", ["1"], 1, "200", "200", "0.5", "0.5", "0.5", 512, 512, 512,
                              1, 100101, "", "", "")
        series_service.insert(2, "series4", "series4/path", ["1"], 1, "200", "200", "0.5", "0.5", "0.5", 512, 512, 512,
                              1, 100101, "", "", "")

        res = client.get(url_for('list_all_studies', instance_id=1))
        assert len(res.json[0]) == 2
        assert res.json[0][0]["instance_id"] == 1
        assert res.json[0][0]["patient_uid"] == "Dicom_691_2"
        assert res.json[1][0]["instance_id"] == 1
        assert res.json[1][0]["patient_uid"] == "Raw_1003/3CH_tagging"
        assert res.status == '200 OK'

    def test_list_series_in_one_study(self, client):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        series_service = SeriesService(conn)
        series_service.delete({"study_id": 1})
        series_service.delete({"study_id": 2})

        series_service.insert(2, "series_description1", "series_path",
                              "['export0001.dcm','export0002.dcm','export0003.dcm','export0004.dcm']", 4, None, None,
                              None, None, None, None, None, None, None, None, None, None, None)
        res = client.get(url_for('list_all_series', study_id=1))
        assert res.json == {}

        res = client.get(url_for('list_all_series', study_id=2))
        assert len(res.json) == 1
        assert res.json[0]["study_id"] == 2
        assert res.json[0]["series_description"] == "series_description1"
        assert len(eval(res.json[0]["series_files_list"])) == 4

    def test_instance_detail(self, client):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        label_candidate = LabelCandidatesService(conn)
        label_candidate.insert(1, 0, 0, "['10,10;12,12;14,16;','10,10;12,12;14,16;']")
        label_candidate.insert(1, 1, 1, "['selectoption1','selectoption2']")

        res = client.get(url_for('instance_detail', instance_id=1))

        # Verify instance record items.
        assert res.json["name"] == "Stroke Annotation Task"
        assert res.json["modality"] == "CT"
        assert len(res.json["label_candidates"]) == 2

        res = client.get(url_for('instance_detail', instance_id=1000))

        assert res.json == {}

    def test_instance_detail_delete(self, client):
        ini_service = InitialService()
        conn = ini_service.get_connection()

        instance_service = InstanceService(conn)
        instance_id = instance_service.insert("Stroke Annotation Task2", "CT",
                                              "The stroke CT scans for annotation tasks.",
                                              "tests/services/sample_data", 0, 200, 1, 0)

        res = client.delete(url_for('instance_detail', instance_id=instance_id))
        assert res.json == {}
        assert res.status == "200 OK"

        res = client.delete(url_for('instance_detail', instance_id=instance_id))
        assert res.json == {}
        assert res.status == "404 NOT FOUND"

    def test_instance_detail_put(self, client):
        res = client.put(url_for('instance_detail', instance_id=1), data=json.dumps({
            "name": "Cornell_LBBB",
            "modality": "US",
            "annotator_id": "0|1"
        }))

        assert res.status == "201 CREATED"

    def test_get_dicom_image(self, client):
        res = client.get(
            url_for('get_dcm_img', data_path="tests/services/sample_data", folder_name="Raw_1003/3CH_tagging",
                    file_name="export0001.dcm"))

        assert res.status == "200 OK"
        assert res.content_type == "application/DICOM"

        res = client.get(
            url_for('get_dcm_img', data_path="tests/services/sample_data", folder_name="Raw_1003/3CH_tagging",
                    file_name="export0001_not_exist.dcm"))

        assert res.status == "404 NOT FOUND"
        assert res.content_type == "application/json"

    # def test_finish_series(self, client):
    #
    #     res = client.post(url_for('finish_series'))


