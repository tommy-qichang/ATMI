from setuptools import setup, find_packages

setup(
    name='ATMI',
    version='0.5.0',
    description='Annotation tool for Medical Image',
    author='Qi Chang',
    author_email='tommy.qichang@gmail.com',
    license='GPL',
    home_page='',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask>=1',
        'Flask-Webpack>=0.0.7',
        'h5py>=2,<3',
        'scipy>=1,<2',
        'pydicom==1.3.0',
        'scikit-image==0.16.2',
        'matplotlib==3.1.2',
        'pillow==6.2.1',
        'codecov==2.1',
        'pytictoc==1.5.0',
        'opencv-python==4.0.1.24',
        'tensorflow>=2.0',
        'voxelmorph==0.1'
    ]
)