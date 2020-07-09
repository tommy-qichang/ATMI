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
        assert len(list) == 3
        assert os.path.join("./tests/services/sample_data", "Dicom_691_2") in list
        assert os.path.join("./tests/services/sample_data", "Raw_1003", "3CH_tagging") in list
        assert list[os.path.join("./tests/services/sample_data", "Dicom_691_2")][0] == "IM-0118-0001.dcm"

    def test_extract_series_from_path(self):
        se = SeriesExtractionService()
        data_path = "./tests/services/sample_data"
        series_list = se.extract_series_from_path(data_path)

        assert len(series_list) == 2
        assert len(series_list['1.2.840.113619.2.248.116520525445.30208.1391089807062.2'][
                       "./tests/services/sample_data/Dicom_691_2"]) == 1
        assert len(series_list['1.2.840.114350.2.232.2.798268.2.230853335.1'][
                       "./tests/services/sample_data/Raw_1003/3CH_tagging"]) == 1
