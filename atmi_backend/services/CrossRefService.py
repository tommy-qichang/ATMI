import os
from datetime import datetime

import numpy as np
import pydicom
from atmi_backend.utils import remove_small_3d, extract_contours, prep_transfer_data, vox2world, world2vox, \
    save_thumnail
from flask import Flask

app = Flask("atmi.app")


class CrossRefService:

    def accumulate_contours(self, labels, scale=4):  # noqa: C901

        label_list = {}
        for label_obj in labels:
            files = eval(label_obj['files'])
            path = label_obj['path']
            if not os.path.exists(os.path.join(path, files[0])):
                continue
            dcm = pydicom.dcmread(os.path.join(path, files[0]), stop_before_pixels=True)
            label = label_obj['data']
            files_path = [os.path.join(path, file) for file in files]

            lv_label = remove_small_3d(label, 2)

            series_uid = label_obj['series']
            study_uid = label_obj['study']
            app.logger.info(f"load dcm:{os.path.join(path, files[0])}")

            label_list[series_uid] = {
                "SeriesDescription": label_obj['description'],
                "ImageOrientationPatient": dcm.ImageOrientationPatient,
                "ImagePositionPatient": dcm.ImagePositionPatient,
                "PixelSpacing": dcm.PixelSpacing,
                "FilesPath": files_path,
                "label": lv_label
            }
            if "SpacingBetweenSlices" in dcm:
                SpacingDistance = dcm.SpacingBetweenSlices
            app.logger.debug(
                f"desc:{dcm.SeriesDescription}, position:{dcm.ImagePositionPatient}, orientation:{dcm.ImageOrientationPatient}, study uid:{study_uid}, series uid:{series_uid}")

            contours_list = extract_contours(lv_label, scale, dcm)
            label_list[series_uid]['contours'] = contours_list

        for serie in label_list:
            label_list[serie]['SliceDistance'] = SpacingDistance

        return label_list

    def merge_dicom_orientation(self, label_list):
        frame_contours = []
        frame_series_info = []
        mean = []
        std = []
        for series_id in label_list:
            series = label_list[series_id]
            conf = prep_transfer_data(series)

            contours = series['contours']
            files_path = series['FilesPath']
            for idx, value in enumerate(contours):
                if idx > len(frame_contours):
                    frame_contours.append([])
                    frame_series_info.append({})
                for sub_contour in value:
                    coords = np.squeeze(sub_contour['data'])
                    if len(coords) > 20:
                        new_contour = vox2world(conf, coords)
                        mean.append([new_contour[:, 0].mean(), new_contour[:, 1].mean(), new_contour[:, 2].mean()])
                        std.append([new_contour[:, 0].std(), new_contour[:, 1].std(), new_contour[:, 2].std()])
                        if len(frame_contours) <= idx:
                            frame_contours.append([])
                            frame_series_info.append({})

                        file_path = ["assets", "ref_cache"] + files_path[idx].replace("_HD","").split("/")[2:-1]
                        filename = files_path[idx].split("/")[-1]+"_thumb.jpg?t="+str(datetime.timestamp(datetime.now()))
                        url_path = "/".join(file_path)

                        frame_contours[idx].append({"data": new_contour.tolist(),
                                                    "desc": sub_contour['desc'],
                                                    "file_path": "/"+os.path.join(url_path,filename),
                                                    "series_id": series_id})
                        key = "unknown"
                        if "ch" in sub_contour['desc'].lower():
                            # Long Axis Series
                            if "lax" not in frame_series_info[idx]:
                                frame_series_info[idx]["lax"] = []
                            key = "lax"
                        elif "sax" in sub_contour['desc'].lower():
                            # Short Axis Series
                            if "sax" not in frame_series_info[idx]:
                                frame_series_info[idx]["sax"] = []
                            key = "sax"

                        frame_series_info[idx][key].append({"data": new_contour,
                                                            "desc": sub_contour['desc'],
                                                            "transfer_conf": conf,
                                                            "series_id": series_id,
                                                            "file_path": files_path[idx]})

        mean = np.array(mean).mean(axis=0)
        std = np.array(std).mean(axis=0)
        return {"contours": frame_contours,
                "mean": mean.tolist(),
                "std": std.tolist()}, frame_series_info

    def projection_sax_lax(self, frame_series_info):
        desire_size = 400
        for frame in frame_series_info:
            lax_series = frame['lax']
            sax_series = frame['sax']

            for one_lax in lax_series:
                lax_file_path = one_lax['file_path']
                lax_file_path = lax_file_path.replace("_HD", "")
                lax_transfer_conf = one_lax['transfer_conf']

                if "file_img" not in one_lax:
                    lax_slice_dcm = pydicom.dcmread(lax_file_path)
                    lax_slice_img = lax_slice_dcm.pixel_array
                    mask = np.zeros_like(lax_slice_img)
                    one_lax['file_img'] = np.stack([lax_slice_img, lax_slice_img, lax_slice_img, mask], axis=-1)
                lax_img = one_lax['file_img']

                for one_sax in sax_series:
                    sax_file_path = one_sax['file_path']
                    sax_file_path = sax_file_path.replace("_HD", "")
                    sax_transfer_conf = one_sax['transfer_conf']
                    sax_contours = one_sax['data']
                    sax_contours = np.array(sax_contours)

                    if "file_img" not in one_sax:
                        sax_slice_dcm = pydicom.dcmread(sax_file_path)
                        sax_slice_img = sax_slice_dcm.pixel_array
                        mask = np.zeros_like(sax_slice_img)
                        one_sax['file_img'] = np.stack([sax_slice_img, sax_slice_img, sax_slice_img, mask], axis=-1)
                    sax_img = one_sax['file_img']

                    orig = lax_transfer_conf[0]
                    M = lax_transfer_conf[1]
                    D = - np.dot(M[:, 2], orig)

                    plane_point_distance = np.abs(sax_contours.dot(M[:, 2]) + D) / np.sqrt(np.dot(M[:, 2], M[:, 2]))
                    ordered_distance = sorted(plane_point_distance.copy().tolist())
                    idx1 = plane_point_distance.tolist().index(ordered_distance[0])
                    coord1 = sax_contours[idx1]

                    idx = 1
                    idx2 = plane_point_distance.tolist().index(ordered_distance[idx])
                    coord2 = sax_contours[idx2]
                    distance = np.linalg.norm(coord1 - coord2)
                    while(distance<1):
                        idx += 1
                        idx2 = plane_point_distance.tolist().index(ordered_distance[idx])
                        coord2 = sax_contours[idx2]
                        distance = np.linalg.norm(coord1 - coord2)

                    sax_coord1 = np.round(world2vox(sax_transfer_conf, coord1)).astype('int')
                    sax_coord2 = np.round(world2vox(sax_transfer_conf, coord2)).astype('int')
                    lax_coord1 = np.round(world2vox(lax_transfer_conf, coord1)).astype('int')
                    lax_coord2 = np.round(world2vox(lax_transfer_conf, coord2)).astype('int')

                    # sax_img[sax_coord1[1] - 1:sax_coord1[1] + 1, sax_coord1[0] - 1:sax_coord1[0] + 1, 3] = 1
                    # sax_img[sax_coord2[1] - 1:sax_coord2[1] + 1, sax_coord2[0] - 1:sax_coord2[0] + 1, 3] = 1
                    # lax_img[lax_coord1[1] - 1:lax_coord1[1] + 1, lax_coord1[0] - 1:lax_coord1[0] + 1, 3] = 1
                    # lax_img[lax_coord2[1] - 1:lax_coord2[1] + 1, lax_coord2[0] - 1:lax_coord2[0] + 1, 3] = 1

                    sax_img[sax_coord1[1], sax_coord1[0], 3] = 1
                    sax_img[sax_coord2[1], sax_coord2[0], 3] = 1
                    lax_img[lax_coord1[1], lax_coord1[0], 3] = 1
                    lax_img[lax_coord2[1], lax_coord2[0], 3] = 1

        for frame in frame_series_info:
            lax_series = frame['lax']
            sax_series = frame['sax']
            for one_lax in lax_series:
                lax_file_path = one_lax['file_path']
                lax_file_path = lax_file_path.replace("_HD", "")
                lax_img = one_lax['file_img']
                save_thumnail(desire_size, lax_img, lax_file_path)

            deduplicted_sax_series = []
            for idx, one_sax in enumerate(sax_series):
                if "INNER_" in one_sax['desc']:
                    assert idx != 0, "INNER series should at least start from 2"
                    inner_id = one_sax['series_id']
                    outer_id = sax_series[idx-1]['series_id']
                    if inner_id == outer_id:
                        deduplicted_sax_series[-1]['file_img'][:,:,3] = sax_series[idx - 1]['file_img'][:,:,3] + one_sax['file_img'][:,:,3]
                else:
                    deduplicted_sax_series.append(one_sax)

            for idx, one_sax in enumerate(deduplicted_sax_series):
                sax_file_path = one_sax['file_path']
                sax_file_path = sax_file_path.replace("_HD", "")
                sax_img = one_sax['file_img']
                save_thumnail(desire_size, sax_img, sax_file_path)
