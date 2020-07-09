from atmi_backend.services.DICOMParser import DICOMParser


class TestDICOMParser:

    def test_extract_series(self):
        all_series = DICOMParser.extract_series("./tests/services/sample_data/Dicom_691_2",
                                                ['IM-0118-0001.dcm', 'IM-0118-0002.dcm'])

        assert len(all_series) == 1
        assert all_series[0].name == 'MDC_0_6_mm_75_St_20'
        assert all_series[0]._filenames[0] == "IM-0118-0001.dcm"
        assert all_series[0]._filenames[1] == "IM-0118-0002.dcm"
        assert all_series[0]._suid == "1.2.840.113619.2.248.116520525445.30208.1391089807603.26"
        assert all_series[0]._shape == [2, 512, 512]
        assert all_series[0]._sampling == [0.625, 0.433594, 0.433594]

        all_series = DICOMParser.extract_series("./tests/services/sample_data/Dicom_691_2",
                                                ['IM-0118-0002.dcm', 'IM-0118-0001.dcm'])

        assert len(all_series) == 1
        assert all_series[0].name == 'MDC_0_6_mm_75_St_20'
        assert all_series[0]._filenames[0] == "IM-0118-0001.dcm"
        assert all_series[0]._filenames[1] == "IM-0118-0002.dcm"
        assert all_series[0]._suid == "1.2.840.113619.2.248.116520525445.30208.1391089807603.26"
        assert all_series[0]._shape == [2, 512, 512]
        assert all_series[0]._sampling == [0.625, 0.433594, 0.433594]
