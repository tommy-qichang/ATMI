import json
import os
from time import sleep

import pydicom
import numpy as np
from cv2 import cv2
import pylab as plb
from matplotlib import cm
import voxelmorph as vxm

from atmi_backend.config import VXM_MODEL_PATH, VOL_SHAPE
from atmi_backend.db_interface.LabelService import LabelService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.util.active_contour import img_laplacian, add_border, Contour
from atmi_backend.util.contour import activeContour
from atmi_backend.util.snake import Snake
from atmi_backend.util.utils import zoom, square_img, smooth_obj_one_case


class SmartPropagation:

    def __init__(self, connection):
        self.conn = connection

        self.vxm_model = self.vxm_model(VXM_MODEL_PATH,VOL_SHAPE)
        self.vxm_reg = self.vxm_model.get_registration_model()
        self.vxm_transform = vxm.networks.Transform(VOL_SHAPE, interp_method='nearest')

    def propagate(self, series_id, from_file_id, to_file_id):
        series_service = SeriesService(self.conn)
        label_service = LabelService(self.conn)
        series = series_service.query({"series_id": series_id})
        if len(series) != 1:
            return False
        series = series[0]

        series_path = series['series_path']
        series_files = eval(series['series_files_list'])
        from_file = series_files[from_file_id]
        to_file = series_files[to_file_id]

        from_label = label_service.get_label(series_id, from_file)
        # to_label = label_service.get_label(series_id, to_file_id)

        from_ds = pydicom.dcmread(os.path.join(series_path, from_file))
        from_dcm = from_ds.pixel_array
        to_ds = pydicom.dcmread(os.path.join(series_path, to_file))
        to_dcm = to_ds.pixel_array

        to_shape = to_dcm.shape

        process_data, process_label = self.preprocess_data([from_dcm, to_dcm], from_label)

        val_input = [process_data[np.newaxis,0,:,:,np.newaxis], process_data[np.newaxis,1,:,:,np.newaxis]]
        val_pred = self.vxm_reg.predict(val_input)
        val_label = self.vxm_transform([process_label, val_pred]).numpy().squeeze()

        # val_label[val_label>=0.5] = 1
        # val_label[val_label < 0.5] = 0


        val_label = self.recover_data(val_label, to_shape, np.unique(from_label))

        content_1D = np.reshape(val_label, val_label.shape[0] * val_label.shape[1])
        unique_id = np.unique(content_1D).tolist()
        compressed_content_1D = LabelService.compress_content(content_1D)

        content = {
            "labelmap2D": {"pixelData": compressed_content_1D, "segmentsOnLabelmap": unique_id,
                           "dataLength": content_1D.shape[0]}}
        # label_service.insert(series['series_id'], 1, to_file_id,str.encode(json.dumps(content)))
        return content

    def recover_data(self, label, orig_size, unique_label):
        """
        recover the img to the original size by zooming back and cropping the image.
        :param label:
        :param orig_size:
        :param unique_label:
        :return:
        """
        x, y = orig_size
        orig_max_size = max(orig_size)

        orig_label = zoom(label, orig_max_size, order=0)

        # orig_img = orig_img[x, (orig_max_size - y) // 2:(orig_max_size - y) // 2 + y] if orig_max_size == x else orig_img[(orig_max_size - x) // 2:(orig_max_size - x) // 2 + x ,y]
        orig_label = orig_label[:, (orig_max_size - y) // 2:(orig_max_size - y) // 2 + y] if orig_max_size == x else orig_label[(orig_max_size - x) // 2:(orig_max_size - x) // 2 + x ,:]

        orig_label = smooth_obj_one_case(orig_label[:,:,None],)

        return orig_label


    def preprocess_data(self, data_all, label_t1):
        """
        format the input data and label to [0,1], and size as 256.
        :param data_all:
        :param label_t1:
        :return:
        """
        print(f"preprocess_data, data_from:{data_all[0].shape}, data_to:{data_all[1].shape} label_t1:{label_t1.shape}")
        preset_imgsize = VOL_SHAPE[0]
        process_data = []
        for img in data_all:
            img1 = img
            img1 = zoom(square_img(img1), preset_imgsize)
            img1 = (img1 - img1.min()) / img1.max()
            process_data.append(img1)

        process_data = np.stack(process_data, axis=0)
        process_label = zoom(square_img(label_t1), preset_imgsize, 0)

        return process_data, process_label

    def vxm_model(self,model_source, vol_shape):
        nb_features = [
            [32, 32, 32, 32],  # encoder features
            [32, 32, 32, 32, 32, 16]  # decoder features
        ]

        # unet
        vxm_model = vxm.networks.VxmDense(vol_shape, nb_features, int_steps=0)
        vxm_model.load_weights(model_source)
        return vxm_model



def _display(image, snaxels=None):
    """
    Display a grayscale image with pylab, and draw the contour if there is any.
    """
    plb.clf()
    if snaxels is not None:
        for s in snaxels:
            plb.plot(s[0], s[1], 'g.', markersize=1.0)

    plb.imshow(image, cmap=cm.Greys_r)
    plb.draw()

    return
