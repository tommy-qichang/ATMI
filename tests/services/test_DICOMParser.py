from atmi_backend.services.DICOMParser import DICOMParser


class TestDICOMParser:

    def test_extract_series(self):
        all_series = DICOMParser.extract_series("./tests/services/sample_data/Dicom_691_2",
                                                ['IM-0118-0001.dcm', 'IM-0118-0002.dcm', 'IM-0118-0003.dcm',
                                                 'IM-0118-0004.dcm', 'IM-0118-0005.dcm', 'IM-0118-0006.dcm',
                                                 'IM-0118-0007.dcm', 'IM-0118-0008.dcm', 'IM-0118-0009.dcm',
                                                 'IM-0118-0010.dcm', 'IM-0118-0011.dcm', 'IM-0118-0012.dcm',
                                                 'IM-0118-0013.dcm', 'IM-0118-0014.dcm', 'IM-0118-0015.dcm',
                                                 'IM-0118-0016.dcm', 'IM-0118-0017.dcm', 'IM-0118-0018.dcm',
                                                 'IM-0118-0019.dcm', 'IM-0118-0020.dcm', 'IM-0118-0021.dcm',
                                                 'IM-0118-0022.dcm', 'IM-0118-0023.dcm', 'IM-0118-0024.dcm',
                                                 'IM-0118-0025.dcm', 'IM-0118-0026.dcm', 'IM-0118-0027.dcm',
                                                 'IM-0118-0028.dcm', 'IM-0118-0029.dcm', 'IM-0118-0030.dcm'])

        assert len(all_series) == 1
        assert all_series[0].name == 'MDC_0_6_mm_75_St_20'
        assert all_series[0]._filenames[0] == "IM-0118-0001.dcm"
        assert all_series[0]._filenames[29] == "IM-0118-0030.dcm"
        assert all_series[0]._suid == "1.2.840.113619.2.248.116520525445.30208.1391089807603.26"
        assert all_series[0]._shape == [30, 512, 512]
        assert all_series[0]._sampling == [0.625, 0.433594, 0.433594]

        all_series = DICOMParser.extract_series("./tests/services/sample_data/Dicom_691_2",
                                                [
                                                    'IM-0118-0010.dcm', 'IM-0118-0011.dcm', 'IM-0118-0012.dcm',
                                                    'IM-0118-0019.dcm', 'IM-0118-0020.dcm', 'IM-0118-0021.dcm',
                                                    'IM-0118-0022.dcm', 'IM-0118-0023.dcm', 'IM-0118-0024.dcm',
                                                    'IM-0118-0001.dcm', 'IM-0118-0002.dcm', 'IM-0118-0003.dcm',
                                                    'IM-0118-0028.dcm', 'IM-0118-0029.dcm', 'IM-0118-0030.dcm',
                                                    'IM-0118-0004.dcm', 'IM-0118-0005.dcm', 'IM-0118-0006.dcm',
                                                    'IM-0118-0007.dcm', 'IM-0118-0008.dcm', 'IM-0118-0009.dcm',
                                                    'IM-0118-0013.dcm', 'IM-0118-0014.dcm', 'IM-0118-0015.dcm',
                                                    'IM-0118-0016.dcm', 'IM-0118-0017.dcm', 'IM-0118-0018.dcm',
                                                    'IM-0118-0025.dcm', 'IM-0118-0026.dcm', 'IM-0118-0027.dcm'])

        assert len(all_series) == 1
        assert all_series[0].name == 'MDC_0_6_mm_75_St_20'
        assert all_series[0]._filenames[0] == "IM-0118-0001.dcm"
        assert all_series[0]._filenames[29] == "IM-0118-0030.dcm"
        assert all_series[0]._suid == "1.2.840.113619.2.248.116520525445.30208.1391089807603.26"
        assert all_series[0]._shape == [30, 512, 512]
        assert all_series[0]._sampling == [0.625, 0.433594, 0.433594]
