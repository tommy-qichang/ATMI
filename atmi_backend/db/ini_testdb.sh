#!/usr/bin/env bash

rm -f atmi_db

sqlite3 atmi_db < ./schema.sql

sqlite3 atmi_db < ../../tests/db_interface/resources/mock_data.sql
