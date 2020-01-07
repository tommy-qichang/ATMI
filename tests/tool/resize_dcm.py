import glob
import os

import pydicom
from PIL import Image
from scipy import ndimage


def resize_dcm(source_path, target_path, factor=2):
    files = [f for f in glob.glob(os.path.join(source_path, '**/IM_*'), recursive=True)]
    for file in files:
        path = os.path.dirname(file)
        filename = os.path.basename(file)
        target_sub_path = path[(len(source_path)+1):]
        if not os.path.isdir(os.path.join(target_path, target_sub_path)):
            os.makedirs(os.path.join(target_path, target_sub_path))
        ds = pydicom.dcmread(file)
        dcm = ds.pixel_array
        print(f"resize dcm: {filename}, in path: {path}")
        sup_dcm = ndimage.interpolation.zoom(dcm, factor)
        ds.PixelData = Image.fromarray(sup_dcm).tobytes()
        ds.Rows = dcm.shape[0] * factor
        ds.Columns = dcm.shape[1] * factor
        ds.save_as(os.path.join(target_path, target_sub_path, filename))


resize_dcm("/Users/qichang/CBIM/data/NYU_CMR_Raw", "/Users/qichang/CBIM/data/NYU_CMR_Raw_HD", 4)

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
