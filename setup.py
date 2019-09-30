from setuptools import setup, find_packages

setup(
    name='atmi',
    version='0.0.1',
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
        'pydicom==1.3.0'
    ]
)