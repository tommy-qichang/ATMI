# ATMI - Annotation Tool for Medical Image 
--------------------------------------

[![CircleCI](https://circleci.com/gh/tommy-qichang/ATMI/tree/master.svg?style=shield)](https://circleci.com/gh/tommy-qichang/ATMI/tree/master)
[![codecov](https://codecov.io/gh/tommy-qichang/ATMI/branch/master/graph/badge.svg)](https://codecov.io/gh/tommy-qichang/ATMI)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

The ATMI (Annotation Tool for Medical Image) provides a user friendly and comprehensive tool for medical image annotation especially for machine learning purpose. 

The following features will be implemented in this system:

1.	**All-in-one solution and easy to install :** No worry about database, backend, frontend and many other stuff. ATMI integrate them together! So when you want to start annotation, just download ATMI and run!
2.	**Multi-tasks capability:** Create multiple instance(annotation tasks) under the same system. So, you don’t need to install multiple times.
3.	**Audit process embeded<under construction>:** Audit process embedded. Different annotators could contour one case multiple times and arbitrate by the auditors.
4.	**Support comprehensive annotation methods:** Provide multiple annotation methods to meet the requirements of any medical annotation tasks, especially for machine learning settings. 
5.	**Support medical operations:** Provide medical professional operations to help annotators view medical images correctly and efficiently. For instance, modify window width/ window level. Could extract multiple series/phases.
6.	**Support iPad and finger gestures :** Able to annotate using iPad and pencils. Finger gestures friendly.
7.	**Easy to navigate between different slices/series/cases/tasks:** Automatically extract different series. Able to play medical images frame by frame and paste annotations from the last frame to the current frame.
8.  **Natually integrate with Machine learning tasks:** Easy to import the masks predicted by any machine learning algorithms. Easy to export the masks as Hdf5 files for future use.

## How to install ATMI.
You need to install Python3 and Nodejs(v10) first.
1. <option> Setup an virtual environment for python 3 like [conda](https://docs.conda.io/en/latest/miniconda.html), and activate. 
2. Unzip/clone the ATMI code folder.   
3. `pip install -r requirements.txt` under ATMI folder.
4. `cd atmi; npm install;npx webpack`  build JS files
5. `cd ..; sh run_flask.sh`


## Steps to setup development environment.

1. Install Python3 and Nodejs.
2. In China, please install **cnpm** for a better performance : `npm install -g cnpm --registry=https://registry.npm.taobao.org`
3. CD root folder of ATMI project, run `pip install tox`
4. run `tox -r` to install virtual environment and libraries. (include Python,Flask lib, python test related lib etc)

    4.1 If you are using IDE, please use the python interpreter under tox path: `./.tox/py37/bin/python`.
    
    4.2 If you are using Command line, please direct activate py3 environment: `cd ./.tox/py37/bin/ && source ./activate && cd -`
    
    
5. CD atmi folder: `cd atmi` and install packages, run `npm install` (or `cnpm install` ).
6. RUN the project in debug model:

    6.1 open another terminal, and run `npm run watch` to launch webpack. 
    
    6.2 run `python __init__.py`


    
