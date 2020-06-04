-- DELETE
-- FROM users;
-- DELETE
-- FROM instances;
-- DELETE
-- FROM instances_users;
-- DELETE
-- FROM label_candidates;
-- DELETE
-- FROM studies;
-- DELETE
-- FROM series;
-- DELETE
-- FROM labels;

-- INSERT INTO users(name, email, pwd, init_code, user_type)
-- VALUES ("qi chang", "tommy.qichang@gmail.com",
--         "b''\x08LZ\xda\xea\x84S\xa5\x9c\xbf\xdaz\xa9r\xb0%''$$$b''\xf8vX\x82\x0f} #\xc2\xf8\xfe\x99\xa8u\xf6a\xef2\xe2V7\xdd$\xd27\x94.\xe1CIo\xdb''",
--         "", 0);


INSERT INTO instances(name, modality, description, data_path, has_audit, study_num, annotated_num)
VALUES ("Derivate_Cardial_MRI_DB", "MRI", "Cardial MRI images in Cornell", "./data/Cornell_LBBB", 0, 197, 0);
-- -- VALUES ("Cardial_MRI_DB", "MRI", "Cardial MRI images in NYU", "./data/NYU_CMR_Raw", 0, 6, 0),
-- --        ("Cardial_MRI_DB_HD", "MRI", "High Dimension Cardial MRI images in NYU(upsampled)", "./data/NYU_CMR_Raw_HD", 0,
-- --         6, 0);
--
INSERT INTO instances_users(user_id, instance_id, is_auditor)
VALUES (1, 0, 0);
--
INSERT INTO label_candidates(instance_id, label_type, input_type, text)
VALUES (1, 0, NULL, "RVC"),
       (1, 0, NULL, "LVM"),
       (1, 0, NULL, "LVC"),
       (1, 1, "input", '{"key":"Note","value":""}');

-- INSERT INTO label_candidates(instance_id, label_type, input_type, text)
-- VALUES (1, 0, NULL, "RVC"),
--        (1, 0, NULL, "LVM"),
--        (1, 0, NULL, "LVC"),
-- --        (1, 1, "selectbox", '{"key":"Dyssynchrony","value":["negative","positive"]}'),
--        (1, 1, "input", '{"key":"Note","value":""}'),
--        (2, 0, NULL, "RVC"),
--        (2, 0, NULL, "LVM"),
--        (2, 0, NULL, "LVC"),
-- --        (2, 1, "selectbox", '{"key":"Dyssynchrony","value":["negative","positive"]}'),
--        (2, 1, "input", '{"key":"Note","value":""}');

-- INSERT INTO studies(instance_id, suid, folder_name, total_files_number, annotators, auditors, status)
-- VALUES (1,'1313', "./data/CCTA/CRE_120-1014-CCTA-10-139967", 50, NULL, NULL, 1),
--        (1,'32', "./data/CCTA/DICOM", 90, NULL, NULL, 1),
--        (1,'332', "./data/CCTA/Dicom_691_2", 25, NULL, NULL, 1),
--        (2,'324', "./data/MRI/3CH_tagging", 25, NULL, NULL, 1),
--        (2,'325', "./data/MRI/3CH_tagging_30", 25, NULL, NULL, 1),
--        (2,'326', "./data/MRI/SAX_tagging_apex", 25, NULL, NULL, 1),
--        (2,'327', "./data/MRI/SAX_tagging_base", 25, NULL, NULL, 1);

-- INSERT INTO series(study_id, series_description, series_files_list, series_files_number)
-- VALUES (1, "CRE_CCTA",
--         '["IM-0001-0001.dcm", "IM-0001-0002.dcm", "IM-0001-0003.dcm", "IM-0001-0004.dcm", "IM-0001-0005.dcm", "IM-0001-0006.dcm", "IM-0001-0007.dcm", "IM-0001-0008.dcm", "IM-0001-0009.dcm", "IM-0001-0010.dcm", "IM-0001-0011.dcm", "IM-0001-0012.dcm", "IM-0001-0013.dcm", "IM-0001-0014.dcm", "IM-0001-0015.dcm", "IM-0001-0016.dcm", "IM-0001-0017.dcm", "IM-0001-0018.dcm", "IM-0001-0019.dcm", "IM-0001-0020.dcm", "IM-0001-0021.dcm", "IM-0001-0022.dcm", "IM-0001-0023.dcm", "IM-0001-0024.dcm", "IM-0001-0025.dcm", "IM-0001-0026.dcm", "IM-0001-0027.dcm", "IM-0001-0028.dcm", "IM-0001-0029.dcm", "IM-0001-0030.dcm", "IM-0001-0031.dcm", "IM-0001-0032.dcm", "IM-0001-0033.dcm", "IM-0001-0034.dcm", "IM-0001-0035.dcm", "IM-0001-0036.dcm", "IM-0001-0037.dcm", "IM-0001-0038.dcm", "IM-0001-0039.dcm", "IM-0001-0040.dcm", "IM-0001-0041.dcm", "IM-0001-0042.dcm", "IM-0001-0043.dcm", "IM-0001-0044.dcm", "IM-0001-0045.dcm", "IM-0001-0046.dcm", "IM-0001-0047.dcm", "IM-0001-0048.dcm", "IM-0001-0049.dcm", "IM-0001-0050.dcm", "IM-0001-0051.dcm", "IM-0001-0052.dcm", "IM-0001-0053.dcm", "IM-0001-0054.dcm", "IM-0001-0055.dcm", "IM-0001-0056.dcm", "IM-0001-0057.dcm", "IM-0001-0058.dcm", "IM-0001-0059.dcm", "IM-0001-0060.dcm", "IM-0001-0061.dcm", "IM-0001-0062.dcm", "IM-0001-0063.dcm", "IM-0001-0064.dcm", "IM-0001-0065.dcm", "IM-0001-0066.dcm", "IM-0001-0067.dcm", "IM-0001-0068.dcm", "IM-0001-0069.dcm", "IM-0001-0070.dcm", "IM-0001-0071.dcm", "IM-0001-0072.dcm", "IM-0001-0073.dcm", "IM-0001-0074.dcm", "IM-0001-0075.dcm", "IM-0001-0076.dcm", "IM-0001-0077.dcm", "IM-0001-0078.dcm", "IM-0001-0079.dcm", "IM-0001-0080.dcm", "IM-0001-0081.dcm", "IM-0001-0082.dcm", "IM-0001-0083.dcm", "IM-0001-0084.dcm", "IM-0001-0085.dcm", "IM-0001-0086.dcm", "IM-0001-0087.dcm", "IM-0001-0088.dcm", "IM-0001-0089.dcm", "IM-0001-0090.dcm", "IM-0001-0091.dcm", "IM-0001-0092.dcm", "IM-0001-0093.dcm", "IM-0001-0094.dcm", "IM-0001-0095.dcm", "IM-0001-0096.dcm", "IM-0001-0097.dcm", "IM-0001-0098.dcm", "IM-0001-0099.dcm", "IM-0001-0100.dcm", "IM-0001-0101.dcm", "IM-0001-0102.dcm", "IM-0001-0103.dcm", "IM-0001-0104.dcm", "IM-0001-0105.dcm", "IM-0001-0106.dcm", "IM-0001-0107.dcm", "IM-0001-0108.dcm", "IM-0001-0109.dcm", "IM-0001-0110.dcm", "IM-0001-0111.dcm", "IM-0001-0112.dcm", "IM-0001-0113.dcm", "IM-0001-0114.dcm", "IM-0001-0115.dcm", "IM-0001-0116.dcm", "IM-0001-0117.dcm", "IM-0001-0118.dcm", "IM-0001-0119.dcm", "IM-0001-0120.dcm", "IM-0001-0121.dcm", "IM-0001-0122.dcm", "IM-0001-0123.dcm", "IM-0001-0124.dcm", "IM-0001-0125.dcm", "IM-0001-0126.dcm", "IM-0001-0127.dcm", "IM-0001-0128.dcm", "IM-0001-0129.dcm", "IM-0001-0130.dcm", "IM-0001-0131.dcm", "IM-0001-0132.dcm", "IM-0001-0133.dcm", "IM-0001-0134.dcm", "IM-0001-0135.dcm", "IM-0001-0136.dcm", "IM-0001-0137.dcm", "IM-0001-0138.dcm", "IM-0001-0139.dcm", "IM-0001-0140.dcm", "IM-0001-0141.dcm", "IM-0001-0142.dcm", "IM-0001-0143.dcm", "IM-0001-0144.dcm", "IM-0001-0145.dcm", "IM-0001-0146.dcm", "IM-0001-0147.dcm", "IM-0001-0148.dcm", "IM-0001-0149.dcm", "IM-0001-0150.dcm", "IM-0001-0151.dcm", "IM-0001-0152.dcm", "IM-0001-0153.dcm", "IM-0001-0154.dcm", "IM-0001-0155.dcm", "IM-0001-0156.dcm", "IM-0001-0157.dcm", "IM-0001-0158.dcm", "IM-0001-0159.dcm", "IM-0001-0160.dcm", "IM-0001-0161.dcm", "IM-0001-0162.dcm", "IM-0001-0163.dcm", "IM-0001-0164.dcm", "IM-0001-0165.dcm", "IM-0001-0166.dcm", "IM-0001-0167.dcm", "IM-0001-0168.dcm", "IM-0001-0169.dcm", "IM-0001-0170.dcm", "IM-0001-0171.dcm", "IM-0001-0172.dcm", "IM-0001-0173.dcm", "IM-0001-0174.dcm", "IM-0001-0175.dcm", "IM-0001-0176.dcm", "IM-0001-0177.dcm", "IM-0001-0178.dcm", "IM-0001-0179.dcm", "IM-0001-0180.dcm", "IM-0001-0181.dcm", "IM-0001-0182.dcm", "IM-0001-0183.dcm", "IM-0001-0184.dcm", "IM-0001-0185.dcm", "IM-0001-0186.dcm", "IM-0001-0187.dcm", "IM-0001-0188.dcm", "IM-0001-0189.dcm", "IM-0001-0190.dcm", "IM-0001-0191.dcm", "IM-0001-0192.dcm", "IM-0001-0193.dcm", "IM-0001-0194.dcm", "IM-0001-0195.dcm", "IM-0001-0196.dcm", "IM-0001-0197.dcm", "IM-0001-0198.dcm", "IM-0001-0199.dcm", "IM-0001-0200.dcm", "IM-0001-0201.dcm", "IM-0001-0202.dcm", "IM-0001-0203.dcm", "IM-0001-0204.dcm", "IM-0001-0205.dcm", "IM-0001-0206.dcm", "IM-0001-0207.dcm", "IM-0001-0208.dcm", "IM-0001-0209.dcm", "IM-0001-0210.dcm", "IM-0001-0211.dcm", "IM-0001-0212.dcm", "IM-0001-0213.dcm", "IM-0001-0214.dcm", "IM-0001-0215.dcm", "IM-0001-0216.dcm", "IM-0001-0217.dcm", "IM-0001-0218.dcm", "IM-0001-0219.dcm", "IM-0001-0220.dcm", "IM-0001-0221.dcm", "IM-0001-0222.dcm", "IM-0001-0223.dcm", "IM-0001-0224.dcm", "IM-0001-0225.dcm", "IM-0001-0226.dcm", "IM-0001-0227.dcm", "IM-0001-0228.dcm", "IM-0001-0229.dcm", "IM-0001-0230.dcm", "IM-0001-0231.dcm", "IM-0001-0232.dcm", "IM-0001-0233.dcm", "IM-0001-0234.dcm", "IM-0001-0235.dcm", "IM-0001-0236.dcm", "IM-0001-0237.dcm", "IM-0001-0238.dcm", "IM-0001-0239.dcm", "IM-0001-0240.dcm", "IM-0001-0241.dcm", "IM-0001-0242.dcm", "IM-0001-0243.dcm", "IM-0001-0244.dcm", "IM-0001-0245.dcm", "IM-0001-0246.dcm", "IM-0001-0247.dcm", "IM-0001-0248.dcm", "IM-0001-0249.dcm", "IM-0001-0250.dcm", "IM-0001-0251.dcm", "IM-0001-0252.dcm", "IM-0001-0253.dcm", "IM-0001-0254.dcm", "IM-0001-0255.dcm", "IM-0001-0256.dcm", "IM-0001-0257.dcm", "IM-0001-0258.dcm", "IM-0001-0259.dcm", "IM-0001-0260.dcm", "IM-0001-0261.dcm", "IM-0001-0262.dcm", "IM-0001-0263.dcm", "IM-0001-0264.dcm", "IM-0001-0265.dcm", "IM-0001-0266.dcm", "IM-0001-0267.dcm", "IM-0001-0268.dcm", "IM-0001-0269.dcm", "IM-0001-0270.dcm", "IM-0001-0271.dcm"]',
--         50),
--        (2, "DICOM",
--         "['export0001.dcm', 'export0002.dcm', 'export0003.dcm', 'export0004.dcm', 'export0005.dcm', 'export0006.dcm', 'export0007.dcm', 'export0008.dcm', 'export0009.dcm', 'export0010.dcm']",
--         50),
--        (3, "DICOM_691_2",
--         "['IM-0118-0001.dcm', 'IM-0118-0002.dcm', 'IM-0118-0003.dcm', 'IM-0118-0004.dcm', 'IM-0118-0005.dcm', 'IM-0118-0006.dcm', 'IM-0118-0007.dcm', 'IM-0118-0008.dcm', 'IM-0118-0009.dcm']",
--         50),
--        (4, "3CH_tagging_Series_dec1",
--         "['export0001.dcm', 'export0002.dcm', 'export0003.dcm', 'export0004.dcm', 'export0005.dcm', 'export0006.dcm', 'export0007.dcm', 'export0008.dcm', 'export0009.dcm', 'export0010.dcm','export0011.dcm', 'export0012.dcm', 'export0013.dcm', 'export0014.dcm', 'export0015.dcm', 'export0016.dcm', 'export0017.dcm', 'export0018.dcm', 'export0019.dcm', 'export0020.dcm','export0021.dcm', 'export0022.dcm', 'export0023.dcm', 'export0024.dcm', 'export0025.dcm']",
--         50),
--        (4, "3CH_tagging_Series_dec2_series2",
--         "['2_export0001.dcm', '2_export0002.dcm', '2_export0003.dcm', '2_export0004.dcm', '2_export0005.dcm', '2_export0006.dcm', '2_export0007.dcm', '2_export0008.dcm', '2_export0009.dcm', '2_export0010.dcm','2_export0011.dcm', '2_export0012.dcm', '2_export0013.dcm', '2_export0014.dcm', '2_export0015.dcm', '2_export0016.dcm', '2_export0017.dcm', '2_export0018.dcm', '2_export0019.dcm', '2_export0020.dcm','2_export0021.dcm', '2_export0022.dcm', '2_export0023.dcm', '2_export0024.dcm', '2_export0025.dcm']",
--         50),
--        (5, "3CH_tagging_Series_dec5",
--         "['2_export0001.dcm', '2_export0002.dcm', '2_export0003.dcm', '2_export0004.dcm', '2_export0005.dcm', '2_export0006.dcm', '2_export0007.dcm', '2_export0008.dcm', '2_export0009.dcm', '2_export0010.dcm']",
--         50),
--        (6, "3CH_tagging_Series_dec6",
--         "['2_export0001.dcm', '2_export0002.dcm', '2_export0003.dcm', '2_export0004.dcm', '2_export0005.dcm', '2_export0006.dcm', '2_export0007.dcm', '2_export0008.dcm', '2_export0009.dcm', '2_export0010.dcm']",
--         50),
--        (7, "3CH_tagging_Series_dec7",
--         "['2_export0001.dcm', '2_export0002.dcm', '2_export0003.dcm', '2_export0004.dcm', '2_export0005.dcm', '2_export0006.dcm', '2_export0007.dcm', '2_export0008.dcm', '2_export0009.dcm', '2_export0010.dcm']",
--         50);




