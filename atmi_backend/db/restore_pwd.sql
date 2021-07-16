UPDATE users
SET name = 'test@cleerly.inc',
    email = 'test@cleerly.inc',
    pwd = "b'\xa6J \xa5\xd6\xb8\x96\x96\xbd\x86\xc9\x7f\xe0QvI'$$$b'\x13\xb0\xb0p\xf5=\x1f\x08\x99\xfc9-\xc1\xed4\x18\xa0Gb\xf3\xa4\xc2.\x03Z\xdc\x04\xd17\xc0\xcaC'",
    init_code = '1617631498.14246',
    user_type = '0'
WHERE
    user_id = 1;
