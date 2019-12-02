import SimpleITK as sitk
import numpy as np
import os
import skimage
from skimage import data
from matplotlib import pyplot as plt
import h5py
import ast
import pydicom
from scipy import ndimage
from PIL import Image


for i in range(1 ,26):
    id = ("0 " +str(i))[-2:]
    ds = pydicom.dcmread(f"IM_00 "+id)
    dcm = ds.pixel_array
    print(dcm.shape)
    if dcm.shape == (240, 198):
        sup_dcm = ndimage.interpolation.zoom(dcm,4)
        ds.PixelData = Image.fromarray(sup_dcm).tobytes()

        ds.Rows = 240*4
        ds.Columns = 198*4
        ds.save_as(f"IM_00"+id)