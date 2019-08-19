#!/usr/bin/env bash
export FLASK_ENV=development
mydir=$(dirname "${BASH_SOURCE}")
cd $mydir
cd ..

#python ./__init__.py

export FLASK_APP=./atmi/app.py
flask run