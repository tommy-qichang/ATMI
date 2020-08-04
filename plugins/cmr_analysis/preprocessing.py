import json

import cv2
import h5py
import numpy as np
import os
import pydicom
import re
from skimage import morphology


def extract_contours_by_study_id(file_path, target_study_id, scale=4):
    """
    Extract each study's series contours in 2D plain, with ImageOrientation, ImagePosition and PixelSpacing info.
    :param file_path: original h5file. Contains all studies' contours.
    :param target_study_id
    :return:
    """
    orig_h5 = h5py.File(file_path, 'r')
    ds = {}
    orig_data_path = "/common/users/qc58/ATMI_3/ATMI"

    for item in orig_h5['train'].keys():
        print(f"process: {item}...")
        m = re.search(r'study:(.*)-series:(.*)', item)
        study_id = m[1]
        series_id = m[2]
        if study_id != target_study_id:
            continue

        # ds[study_id][series_id] =
        attrs = orig_h5[f'train/study:{study_id}-series:{series_id}/data'].attrs
        # ds[study_id][series_id]['label'] =
        label = orig_h5[f'train/study:{study_id}-series:{series_id}/label'][()]
        lv_label = np.zeros_like(label)
        lv_label[label == 2] = 1

        arr = lv_label > 0
        for i in range(lv_label.shape[-1]):
            # img = (np.copy(lv_label[:,:,i])*255).astype(np.uint8)
            # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-x4-orig.jpg", img)
            arr[:, :, i] = morphology.remove_small_holes(arr[:, :, i])
            lv_label[:, :, i] = morphology.remove_small_objects(arr[:, :, i]).astype(np.uint8)

            # img = (np.copy(lv_label[:,:,i])*255).astype(np.uint8)
            # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-x4-removehole.jpg", img)

        # small_lv_label = ndimage.zoom(lv_label, (1/4, 1/4, 1), mode="nearest")

        files = eval(attrs['files'])[0]
        path = attrs['path']
        # path = attrs['path'].replace("NYU_CMR_Raw_HD", "NYU_CMR_Raw")

        dcm = pydicom.dcmread(os.path.join(orig_data_path, path, files))
        print(f"load dcm:{os.path.join(orig_data_path, path, files)}")

        ds[series_id] = {
            "SeriesDescription": dcm.SeriesDescription,
            "ImageOrientationPatient": dcm.ImageOrientationPatient,
            "ImagePositionPatient": dcm.ImagePositionPatient,
            "PixelSpacing": dcm.PixelSpacing,
            "label": lv_label
        }
        if "SpacingBetweenSlices" in dcm:
            SpacingDistance = dcm.SpacingBetweenSlices
        print(
            f"desc:{dcm.SeriesDescription}, position:{dcm.ImagePositionPatient}, orientation:{dcm.ImageOrientationPatient}")

        contours_list = []
        for i in range(lv_label.shape[-1]):
            label_edge = lv_label[:, :, i]
            if len(np.unique(label_edge)) > 1:
                label_edge = (label_edge * 255).astype(np.uint8)

                # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-orig.jpg", label_edge)

                label_edge = cv2.Laplacian(label_edge, cv2.CV_8U)
                # cv2.imwrite(f"/dresden/users/qc58/work/ATMI/output/2/demo/{item}-{i}-edge.jpg", label_edge)
                # label_edge = cv2.Canny(label_edge, 30, 200)
                contours, hierarchy = cv2.findContours(label_edge, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
                sorted(contours, key=len)
                if scale > 1:
                    contours = [c_i / scale for c_i in contours]

                if len(contours) > 0:
                    if contours[-1].shape[0] > 30:
                        append_list = [{"data": contours[-1],"desc":dcm.SeriesDescription}]
                        if "SAX" in dcm.SeriesDescription and len(contours) > 1 and contours[-2].shape[0] > 30:
                            # print(f"SAX, and include the contour.")
                            if len(contours) > 2:
                                append_list.append({"data": contours[-3],"desc":"INNER_"+dcm.SeriesDescription})
                            # append_list.append(contours[-2])

                        contours_list.append(append_list)
            else:
                contours_list.append([])
        ds[series_id]['contours'] = contours_list

    for serie in ds:
        ds[serie]['SliceDistance'] = SpacingDistance

    return ds


def merge_dicom_orientation(ds, target_path):
    frame_contours = []
    mean = []
    std = []
    for series_id in ds:
        series = ds[series_id]
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
        contours = series['contours']
        for idx, value in enumerate(contours):
            if idx > len(frame_contours):
                frame_contours.append([])
            for sub_contour in value:
                coords = np.squeeze(sub_contour['data'])
                ones = np.ones([coords.shape[0], 1])
                new_coords = np.concatenate([coords, ones], axis=1)

                new_contour = np.dot(M, new_coords.T).T + origin_xyz
                mean.append([new_contour[:, 0].mean(), new_contour[:, 1].mean(), new_contour[:, 2].mean()])
                std.append([new_contour[:, 0].std(), new_contour[:, 1].std(), new_contour[:, 2].std()])
                if len(frame_contours) <= idx:
                    frame_contours.append([])
                frame_contours[idx].append({"data":new_contour.tolist(),"desc":sub_contour['desc']})

    mean = np.array(mean).mean(axis=0)
    std = np.array(std).mean(axis=0)
    with open(target_path, 'w') as f:
        json.dump({"contours": frame_contours,
                   "mean": mean.tolist(),
                   "std":std.tolist()}, f)

    # scatters = []
    # for frame in first_frames:
    #     numpy_frame = np.array(frame)
    #     scatters.append(go.Scatter3d(x=numpy_frame[:, 0], y=numpy_frame[:, 1], z=numpy_frame[:, 2], mode='markers',
    #                              marker=dict(size=1)))
    #
    #
    # fig = go.Figure(data=scatters)
    # print(f"write the demo.html")
    # fig.write_html(os.path.join("/dresden/users/qc58/work/ATMI/output/2/","demo4.html"))

    # json_str = json.dumps({"contour":[frame_contours[0]]})
    # file = open(target_path, "w+")
    # file.write(json_str)


# ds = extract_contours_by_study_id("/dresden/users/qc58/work/ATMI/output/2/Export-2-Cardial_MRI_DB_HD-1594615872-0.h5",
# "1.2.840.114350.2.232.2.798268.2.48656772.1")

ds = extract_contours_by_study_id("/dresden/users/qc58/work/ATMI/output/2/Export-2-Cardial_MRI_DB_HD-1594615872-0.h5",
                                  "1.3.12.2.1107.5.2.43.67041.30000015051302394079300000143")

merge_dicom_orientation(ds, "/dresden/users/qc58/work/ATMI/output/2/contours_0.js")
