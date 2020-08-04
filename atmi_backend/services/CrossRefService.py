import numpy as np
import os
import pydicom
from cv2 import cv2
from skimage import morphology

from atmi_backend.utils import remove_small_3d


class CrossRefService:

    def accumulate_contours(self, labels, scale=4):

        label_list = {}
        for label_obj in labels:
            files = eval(label_obj['files'])[0]
            path = label_obj['path']
            dcm = pydicom.dcmread(os.path.join(path, files), stop_before_pixels=True)
            label = label_obj['data']

            lv_label = remove_small_3d(label, 2)

            series_uid = label_obj['series']
            study_uid = label_obj['study']
            print(f"load dcm:{os.path.join(path, files)}")

            label_list[series_uid] = {
                "SeriesDescription": label_obj['description'],
                "ImageOrientationPatient": dcm.ImageOrientationPatient,
                "ImagePositionPatient": dcm.ImagePositionPatient,
                "PixelSpacing": dcm.PixelSpacing,
                "label": lv_label
            }
            if "SpacingBetweenSlices" in dcm:
                SpacingDistance = dcm.SpacingBetweenSlices
            print(
                f"desc:{dcm.SeriesDescription}, position:{dcm.ImagePositionPatient}, orientation:{dcm.ImageOrientationPatient}, study uid:{study_uid}, series uid:{series_uid}")

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
                            append_list = [{"data": contours[-1], "desc": dcm.SeriesDescription}]
                            if "SAX" in dcm.SeriesDescription and len(contours) > 1 and contours[-2].shape[0] > 30:
                                # print(f"SAX, and include the contour.")
                                if len(contours) > 2:
                                    append_list.append({"data": contours[-3], "desc": "INNER_" + dcm.SeriesDescription})
                                # append_list.append(contours[-2])

                            contours_list.append(append_list)
                else:
                    contours_list.append([])
            label_list[series_uid]['contours'] = contours_list

        for serie in label_list:
            label_list[serie]['SliceDistance'] = SpacingDistance

        return label_list

    def merge_dicom_orientation(self, label_list):
        frame_contours = []
        mean = []
        std = []
        for series_id in label_list:
            series = label_list[series_id]
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
                    if len(coords) > 20:
                        ones = np.ones([coords.shape[0], 1])
                        new_coords = np.concatenate([coords, ones], axis=1)

                        new_contour = np.dot(M, new_coords.T).T + origin_xyz
                        mean.append([new_contour[:, 0].mean(), new_contour[:, 1].mean(), new_contour[:, 2].mean()])
                        std.append([new_contour[:, 0].std(), new_contour[:, 1].std(), new_contour[:, 2].std()])
                        if len(frame_contours) <= idx:
                            frame_contours.append([])
                        frame_contours[idx].append({"data": new_contour.tolist(), "desc": sub_contour['desc']})

        mean = np.array(mean).mean(axis=0)
        std = np.array(std).mean(axis=0)
        return {"contours": frame_contours,
                "mean": mean.tolist(),
                "std": std.tolist()}
