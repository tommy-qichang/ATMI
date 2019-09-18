import os

from atmi_backend.services.SeriesExtractionService import SeriesExtractionService


class TestSeriesExtractionService:

    def test_is_quaified_image(self):
        se = SeriesExtractionService()
        assert se.is_quaified_image("000001.dcm") is True
        assert se.is_quaified_image("000001.DCM") is True
        assert se.is_quaified_image("000001.Dcm") is True
        assert se.is_quaified_image("0.dcm") is True
        assert se.is_quaified_image("export0001.dcm.dcm") is True
        # assert se.is_quaified_image("000001.png") is True
        # assert se.is_quaified_image("000001.PNG") is True

    def test_list_files(self):
        se = SeriesExtractionService()
        list = se.list_files("./tests/services/sample_data")
        assert len(list) == 4
        assert os.path.join("./tests/services/sample_data", "Dicom_691_2") in list
        assert os.path.join("./tests/services/sample_data", "Raw_1003", "SAX_tagging_apex") in list
        assert list[os.path.join("./tests/services/sample_data", "Dicom_691_2")][0] == "IM-0118-0001.dcm"

    def test_extract_series_from_path(self):
        se = SeriesExtractionService()
        data_path = "./tests/services/sample_data"
        series_list = se.extract_series_from_path(data_path)

        assert len(series_list) == 4
        assert len(series_list["./tests/services/sample_data/Dicom_691_2"]) == 1
        assert len(series_list["./tests/services/sample_data/Raw_1003/3CH_tagging"]) == 2
        assert [i for i in series_list.keys()][0] == "./tests/services/sample_data/Dicom_691_2"
