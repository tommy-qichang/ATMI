import glob
import os
import sys

import cv2
import pydicom
from PIL import Image
from scipy import ndimage

def is_qualified_dicom(file):
    evl_str = file.lower()
    if ("/dicom" in evl_str or ".dcm" in evl_str or "/im" in evl_str):
        return True
    return False

allFiles = {}
def getListOfFiles(dirName):
    # create a list of file and sub directories
    # names in the given directory
    listOfFile = os.listdir(dirName)
    global allFiles
    # Iterate over all the entries
    for entry in listOfFile:
        sys.stdout.flush()
        # Create full path
        fullPath = os.path.join(dirName, entry)
        # If entry is a directory then get the list of files in this directory
        if os.path.isdir(fullPath):
            getListOfFiles(fullPath)
        elif is_qualified_dicom(fullPath):
            path = os.path.dirname(fullPath)
            file_name = os.path.basename(fullPath)
            if path not in allFiles:
                allFiles[path] = []
                print(f"add path:{path}")
            allFiles[path].append(file_name)
    return allFiles

def resize_dcm(source_path, target_path, factor=2):

    # files = [f for f in glob.glob(os.path.join(source_path, '**/IM_*'), recursive=True)]
    paths = getListOfFiles(source_path)
    for path in paths:
        files = paths[path]
        for file in files:
            sys.stdout.flush()
            file_path = os.path.join(path, file)
            path = os.path.dirname(file_path)
            filename = os.path.basename(file_path)
            target_sub_path = path[(len(source_path)+1):]
            if not os.path.isdir(os.path.join(target_path, target_sub_path)):
                os.makedirs(os.path.join(target_path, target_sub_path))
            try:
                ds = pydicom.dcmread(file_path)
            except Exception as e:
                print(f"Read dicom file error: {file}, with error:{e}")
                continue
            dcm = ds.pixel_array
            print(f"resize dcm: {filename}, in path: {path}")
            sup_dcm = ndimage.interpolation.zoom(dcm, factor)
            ds.PixelData = sup_dcm.tobytes()
            ds.Rows = dcm.shape[0] * factor
            ds.Columns = dcm.shape[1] * factor
            ds.save_as(os.path.join(target_path, target_sub_path, filename))


# resize_dcm("/Users/qichang/CBIM/data/NYU_CMR_Raw", "/Users/qichang/CBIM/data/NYU_CMR_Raw_HD", 4)
# resize_dcm("/Users/qichang/PycharmProjects/ATMI/data/NYU_CMR_Raw", "/Users/qichang/PycharmProjects/ATMI/data/NYU_CMR_Raw_HD", 4)
resize_dcm("/research/cbim/vast/qc58/private-db/cardiac/derivate/Derivate1","/research/cbim/vast/qc58/private-db/cardiac/derivate_hd/Derivate1", 2)
# resize_dcm("/Users/qichang/PycharmProjects/medical_dataset/tmp/sd","/Users/qichang/PycharmProjects/medical_dataset/tmp/hd_tmp",4)

# for i in range(1, 26):
#     id = ("0 " + str(i))[-2:]
#     ds = pydicom.dcmread(f"IM_00 " + id)
#     dcm = ds.pixel_array
#     print(dcm.shape)
#     if dcm.shape == (240, 198):
#         sup_dcm = ndimage.interpolation.zoom(dcm, 4)
#         ds.PixelData = Image.fromarray(sup_dcm).tobytes()
#
#         ds.Rows = 240 * 4
#         ds.Columns = 198 * 4
#         ds.save_as(f"IM_00" + id)
