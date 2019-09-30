from sqlite3 import Error

import pytest

from atmi_backend.db_interface.InitialService import InitialService
from tests.db_interface import setup_sql, teardown_sql
from tests.db_interface.mock_data import mock_data_1


class TestInitialService:

    def setup_class(self):
        print("Setup Testing Environment....")
        setup_sql()

    def teardown_class(self):
        print("Delete Testing TEMP Files....")
        # Remove database and schema files
        teardown_sql()

    def setup_method(self, test_method):
        pass

    def teardown_method(self, test_method):
        pass

    def test_initial_database_nofile(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        records = conn.cursor().fetchall()
        assert (len(records) == 0)

        has_record = ini_service.has_records()
        assert (has_record is False)

        rowid = mock_data_1(conn)
        assert (rowid != 0)

        has_record = ini_service.has_records()
        assert (has_record is True)

    def test_initial_database_file(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        cur = conn.cursor()
        cur.execute('select * from users')
        records = cur.fetchall()
        assert (len(records) == 2)
        has_record = ini_service.has_records()
        assert (has_record is True)

    def test_close_connection(self):
        ini_service = InitialService()
        conn = ini_service.get_connection()
        result = ini_service.close_connection()
        assert result is True
        # After close connection, the connection object could not use anymore because the database is closed.
        with pytest.raises(Error):
            cur = conn.cursor()
            cur.execute('select * from users')

        result = ini_service.close_connection()
        # connection already closed
        assert result is False
