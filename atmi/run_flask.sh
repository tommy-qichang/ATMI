#!/usr/bin/env bash
export FLASK_ENV=development
mydir=$(dirname "${BASH_SOURCE}")
cd $mydir
cd ..
ex
#python ./atmi/app.py

export FLASK_APP=./atmi/app.py
flask run -h 0.0.0.0 -p 80