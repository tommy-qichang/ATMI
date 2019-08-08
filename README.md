# ATMI - Annotation Tool for Medical Image

--------------------------------------

The ATMI (Annotation Tool for Medical Image) provides a user friendly and comprehensive tool for medical annotation purpose. 

The following features will be implemented in this system:

1.	**One Click Install:** Install ATMI just one click without install database, config environments etc. 
2.	**Multi-tasks capability:** Create multiple instance(tasks) under the same system. So, you don’t need to install multiple times.
3.	**Audit process embeded:** Audit process embedded. Different annotators could contour one image multiple times and arbitrate by the auditors.
4.	**Support comprehensive annotation methods:** Provide multiple annotation methods to meet the requirements of any medical annotation tasks, especially for machine learning settings. 
5.	**Support comprehensive medical operations:** Provide medical professional operations to help annotators view medical images correctly and efficiently. For instance, view isotropic images, and modify window width/ window level. Could extract multiple series/phases.
6.	**Support iPad and finger gestures :** Able to annotate using iPad and pencils. Finger gestures friendly.
7.	**Easy to navigate between different slices/series/cases/tasks:** Able to play medical images frame by frame and paste annotations from the last frame to the current frame.


## Steps to setup development environment.

1. Install Python and Nodejs.
2. In China, please install **cnpm** for a better performance : `npm install -g cnpm --registry=https://registry.npm.taobao.org`
3. CD root folder of ATMI project, run `pip install tox`
4. run `tox -r` to install virtual environment and libraries. (include Python,Flask lib, python test related lib etc)

    If you are using IDE, please use the python interpreter under tox path: `./.tox/py37/bin/python`.
    If you are using Command line, please direct activate py3 environment: `cd ./.tox/py37/bin/ && source ./activate && cd -`
    
    
5. CD atmi folder: `cd atmi` and install packages, run `cnpm install`.
6. RUN the project in debug model:

    6.1 open another terminal, and run `npm run watch` to launch webpack. 
    6.2 run `python __init__.py`
