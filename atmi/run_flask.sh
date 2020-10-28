#!/usr/bin/env bash
export FLASK_ENV=production
mydir=$(dirname "${BASH_SOURCE}")
cd $mydir
cd ..

#python ./atmi/app.py

export FLASK_APP=./atmi/app.py
flask run