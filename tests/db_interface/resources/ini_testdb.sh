#!/usr/bin/env bash

sqlite3 atmi_db < ././../../../atmi_backend/db/schema.sql

sqlite3 atmi_db < ./mock_data.sql
