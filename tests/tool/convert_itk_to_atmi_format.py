import os

import SimpleITK as sitk
import h5py
import numpy as np


def load_itk(filename):
    # Reads the image using SimpleITK
    itkimage = sitk.ReadImage(filename)
    # Convert the image to a  numpy array first and then shuffle the dimensions to get axis in the order z,y,x
    ct_scan = sitk.GetArrayFromImage(itkimage)
    # Read the origin of the ct_scan, will be used to convert the coordinates from world to voxel and vice versa.
    origin = np.array(list(reversed(itkimage.GetOrigin())))
    # Read the spacing along each dimension
    spacing = np.array(list(reversed(itkimage.GetSpacing())))
    return ct_scan, origin, spacing


def convertOneSeries(dbfile, label_arr_path, label_arr_id, study_uid, series_uid):
    label, origin, spacing = load_itk(os.path.join(label_arr_path, label_arr_id))
    label = np.moveaxis(label, 0, -1)
    label = np.swapaxes(label, 0, 1)

    dbfile.create_dataset(f"study:{study_uid}/series:{series_uid}/label", data=label)


db_map = {
    "NYU_CON001_7_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.1.0.0",
    "NYU_CON001_8_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.2.0.0",
    "NYU_CON001_9_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.3.0.0",
    "NYU_CON001_10_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.4.0.0",
    "NYU_CON001_11_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.5.0.0",
    "NYU_CON001_12_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.6.0.0",
    "NYU_CON001_13_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.7.0.0",
    "NYU_CON001_14_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.8.0.0",
    "NYU_CON001_15_SAX_STACK_CINE.mhd": "1.3.12.2.1107.5.2.43.67041.2015022510272399601111818.9.0.0",
}


def convertAllSeries(label_arr_path, save_path, study_uid):
    one_study_h5 = h5py.File(os.path.join(save_path, f'{study_uid}.h5'), 'w')
    for k, v in enumerate(db_map):
        convertOneSeries(one_study_h5, label_arr_path, v, study_uid, db_map[v])

    one_study_h5.close()


convertAllSeries(
    "/Users/qichang/odrive/Google-Personal/Acadmic/CBIM/Dong/CBIM-Apri,2019/Code/cardiac_segmentation_analysis/annotation/label",
    "/Users/qichang/PycharmProjects/ATMI/tests/tool", "1.2.840.114350.2.232.2.798268.2.81188688.1")
