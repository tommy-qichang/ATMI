from sqlite3 import Error


def insert_mock_users(cursor, data):
    sql = '''INSERT INTO users(name,email, pwd, init_code, user_type) VALUES (?,?,?,?,?)'''
    cursor.execute(sql, data)

    return cursor.lastrowid


def mock_data_1(conn):
    try:
        user_data = [('Qi Chang', 'tommy.qichang@gmail.com', '&%%THU*^TREHHJ', 'ssdfsad009^*&^*', 0),
                     ('Micheal Jackson', 'm.j@gmail.com', '23423DFDFDF*((', 'sdafasdfsdafdsfds', 1)]
        cursor = conn.cursor()
        rowid = insert_mock_users(cursor, user_data[0])
        rowid = insert_mock_users(cursor, user_data[1])

        conn.commit()
        return rowid
    except Error as e:
        print(e)
