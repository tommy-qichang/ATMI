import numpy as np
from skimage import morphology


def to_bool_or_none(bool_str):
    if bool_str is None:
        return None
    if bool_str.lower() == "true":
        return True
    if bool_str.lower() == "false":
        return False
    raise Exception("bool str invalid.")


def remove_small_3d(pixel_data, label):
    # return pixel_data
    lv_label = np.zeros_like(pixel_data)
    lv_label[pixel_data == label] = 1

    arr = lv_label > 0
    for i in range(lv_label.shape[-1]):
        arr[:, :, i] = morphology.remove_small_holes(arr[:, :, i])
        lv_label[:, :, i] = morphology.remove_small_objects(arr[:, :, i]).astype(np.uint8)

    return lv_label
