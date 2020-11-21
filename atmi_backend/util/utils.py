import os

import numpy as np
import skimage
from cv2 import cv2
from scipy.ndimage import interpolation
# from scipy.ndimage.filters import gaussian_filter
from skimage import morphology
from skimage.transform import resize

from atmi_backend.util.clean_noise import CleanNoise


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


# def extract_contours(lv_label, scale, dcm):
#     contours_list = []
#     for i in range(lv_label.shape[-1]):
#         label_edge = lv_label[:, :, i]
#         if len(np.unique(label_edge)) > 1:
#             label_edge = (label_edge * 255).astype(np.uint8)
#
#             # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-orig.jpg", label_edge)
#
#             label_edge = cv2.Laplacian(label_edge, cv2.CV_8U)
#             # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-edge.jpg", label_edge)
#             # label_edge = cv2.Canny(label_edge, 30, 200)
#             contours, hierarchy = cv2.findContours(label_edge, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
#             sorted(contours, key=len)
#             if scale > 1:
#                 contours = [c_i / scale for c_i in contours]
#
#             if len(contours) > 0:
#                 if contours[-1].shape[0] > 30:
#                     append_list = [{"data": contours[-1], "desc": dcm.SeriesDescription}]
#                     if "SAX" in dcm.SeriesDescription and len(contours) > 1 and contours[-2].shape[0] > 30:
#                         # print(f"SAX, and include the contour.")
#                         if len(contours) > 2:
#                             append_list.append({"data": contours[-3], "desc": "INNER_" + dcm.SeriesDescription})
#                         # append_list.append(contours[-2])
#
#                     contours_list.append(append_list)
#         else:
#             contours_list.append([])
#
#     return contours_list

def extract_contours(lv_label, scale, dcm):
    contours_list = []
    for i in range(lv_label.shape[-1]):
        label_edge = lv_label[:, :, i]
        if len(np.unique(label_edge)) > 1:
            # label_edge = (label_edge * 255).astype(np.uint8)

            contours, _ = cv2.findContours(label_edge.astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
            sorted(contours, key=len)
            if scale > 1:
                contours = [c_i / scale for c_i in contours]

            if len(contours) > 0:
                if contours[-1].shape[0] > 30:
                    append_list = [{"data": contours[-1], "desc": dcm.SeriesDescription}]
                    if "sax" in dcm.SeriesDescription.lower() and len(contours) > 1 and contours[-2].shape[0] > 30:
                        # print(f"SAX, and include the contour.")
                        append_list.append({"data": contours[-2], "desc": "INNER_" + dcm.SeriesDescription})
                        # append_list.append(contours[-2])

                    contours_list.append(append_list)
        else:
            contours_list.append([])

    return contours_list


def prep_transfer_data(series):
    S = list(series['ImagePositionPatient'])
    origin_xyz = [float(s) for s in S]
    # S = [0, 0, 0]
    X = list(series['ImageOrientationPatient'])[:3]
    X = [float(s) for s in X]
    Y = list(series['ImageOrientationPatient'])[3:]
    Y = [float(s) for s in Y]
    Z = np.cross(X, Y)
    transM = np.array([X, Y, Z]).T

    R = list(series['PixelSpacing'])
    R = [float(s) for s in R] + [float(series['SliceDistance'])]
    S = np.eye(3) * R
    # R = np.array([R[0], R[1], R[2]])
    # R = np.array([1, 1, 1])

    M = np.dot(transM, S)

    return [origin_xyz, M]


def vox2world(config, coords):
    origin_xyz = config[0]
    M = config[1]

    zeros = np.zeros([coords.shape[0], 1])
    new_coords = np.concatenate([coords, zeros], axis=1)

    new_contour = np.dot(M, new_coords.T).T + origin_xyz

    return new_contour


def world2vox(config, coords):
    world_coord_xyz = np.array(coords)
    origin_xyz = config[0]
    M = config[1]
    voxel_coord_xyz = np.linalg.solve(M, (world_coord_xyz - origin_xyz).T).T

    return voxel_coord_xyz


def save_thumnail(desire_size, orig_img, orig_path):
    orig_size = orig_img.shape
    highlight_ch = 2
    if orig_img.shape[-1] == 4:
        orig_size = orig_size[:-1]

        orig_img[:, :, highlight_ch][np.where(orig_img[:, :, 3] == 1)] = orig_img.max()
        orig_img[:, :, :2][np.where(orig_img[:, :, 3] == 1)] = 0
        # orig_img[:, :, highlight_ch] = orig_img[:, :, highlight_ch] * orig_img[:, :, 3] * orig_img.max() + \
        #                                orig_img[:, :, highlight_ch]
        orig_img = orig_img[:, :, :3]

    ratio = float(desire_size) / max(orig_size)
    new_size = tuple([int(x * ratio) for x in orig_size])
    new_img = cv2.resize(orig_img, (new_size[1], new_size[0]))

    thumnail_path = [".", "atmi", "public", "ref_cache"] + orig_path.split("/")[2:-1]
    filename = orig_path.split("/")[-1]
    thumnail_path = "/".join(thumnail_path)

    if not os.path.exists(thumnail_path):
        os.makedirs(thumnail_path)
    thumb_img_path = os.path.join(thumnail_path, filename + "_thumb.jpg")

    cv2.imwrite(thumb_img_path, new_img)
    return thumb_img_path


def square_img(img):
    h, w = img.shape
    if h > w:
        pad = (h - w) // 2
        result = np.pad(img, ((0, 0), (pad, h - w - pad)))
    else:
        pad = (w - h) // 2
        result = np.pad(img, ((pad, w - h - pad), (0, 0)))
    return result


def zoom(img, fixed_size, order=3):
    h, w = img.shape
    rate = fixed_size / h
    result = interpolation.zoom(img, rate, order=order)
    return result

def remove_small_obj_one_case(orig_array):
    """
    Remove small objects for each label type and each slice.
    :param orig_array:
    :param keep_num:
    :return:
    """
    clean = CleanNoise(top_num=1)
    for i in range(orig_array.shape[-1]):
        slice = orig_array[:, :, i]
        clean_slice = clean.clean_small_obj(slice)
        orig_array[:, :, i] = clean_slice
    return orig_array

def smooth_obj_one_case(orig_array, filter_type='g'):
    """
    Smooth label array[x, y, z], with scale or size settings.
    :param orig_array:
    :param resize_type:
    :param scale:
    :return:
    """
    scale_array = []
    for i in range(orig_array.shape[-1]):
        slice = orig_array[:, :, i]
        final_mask = np.zeros_like(slice)
        unique_id = np.unique(slice)[1:].tolist()
        if len(unique_id) == 0:
            scale_array.append(slice)
            continue
        for label_id in unique_id:
            show_img = np.zeros_like(slice)
            show_img[slice == label_id] = 1

            if filter_type == "g":
                blurred_img = cv2.GaussianBlur(show_img.astype('float'), (11, 11), 0)
            else:
                blurred_img = cv2.blur(show_img, (10,10))
            # blurred_img = skimage.filters.gaussian_filter(show_img, sigma=4)
            # blurred_img = cv2.blur(show_img, (10,10))

            blurred_img[blurred_img > 0.5] = 1
            blurred_img[blurred_img <= 0.5] = 0
            final_mask[blurred_img == 1] = label_id


        scale_array.append(final_mask)

    return np.stack(scale_array, axis=-1)

def is_qualified_series(type, desc):
    desc = desc.lower()
    if type == "sax":
        matches = ['sax', 'b-tfe', 'cine', 'funzione', 'secondarycapture']
        exclude_matches = ['tag', 'ao', 'ir', 'pa', "stress", "mde", "perfusion", "loc"]
    elif type == "lax":
        matches = ['lax', 'b-tfe', 'funzione', 'secondarycapture']
        exclude_matches = ['tag', 'ao', 'ir', 'pa', "stress", "mde", "perfusion", "loc"]
    else:
        raise RuntimeError("type is wrong.")
    if (not any(x in desc for x in matches)) or (any(y in desc for y in exclude_matches)):
        return False
    return True



