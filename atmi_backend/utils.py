import os

import numpy as np
from cv2 import cv2
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
                    if "SAX" in dcm.SeriesDescription and len(contours) > 1 and contours[-2].shape[0] > 30:
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
