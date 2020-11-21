import h5py
from cv2 import cv2
from scipy.ndimage import zoom

from atmi_backend.util.utils import smooth_obj_one_case, remove_small_obj_one_case, is_qualified_series
import numpy as np

def insert_label(dcm_file_path, seg_file_path):
    dcm_h5 = h5py.File(dcm_file_path, 'r+')
    seg_h5 = h5py.File(seg_file_path, 'r')
    dcm_key_list = list(dcm_h5['train'].keys())
    for idx, key in enumerate(dcm_key_list):
        print(f"process:{idx}/{len(dcm_key_list)}, {key}")
        label = seg_h5[f'train/{key}/label'][()]
        lx,ly,lz = label.shape
        ox,oy,oz = dcm_h5[f"train/{key}/data"].shape
        label = zoom(label, (ox/lx,oy/ly,oz/lz), order=0)
        denoise_label = remove_small_obj_one_case(label)
        smooth_label = smooth_obj_one_case(denoise_label)
        smooth_label[smooth_label>0] = 2
        # del dcm_h5[f"train/{key}/label"]
        dcm_h5.create_dataset(f"train/{key}/label", data=smooth_label, compression='gzip')
    dcm_h5.close()
    seg_h5.close()

insert_label("/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/DyssynchronyProjectDcmFiltered-LAX-Nov17.h5","/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/CAP_LA_segmentation_exp1/test_result-CAP_LA_segmentation_exp1.h5")

def create_sax_pred(seg_file_path, dcm_file_path, target):
    seg_h5 = h5py.File(seg_file_path,'r')
    dcm_h5 = h5py.File(dcm_file_path,'r')
    target_h5 = h5py.File(target, "w")
    for i in dcm_h5['train'].keys():
        desc = dcm_h5[f'train/{i}/data'].attrs['description'].lower()
        # matches = ['sax',  'b-tfe', 'cine', 'funzione', 'secondarycapture']
        # if (any(x in desc for x in matches)):
        if is_qualified_series('sax', desc) or is_qualified_series('lax', desc):
            print(f"Include this series:{i}/{desc}")
            label = seg_h5[f'train/{i}/label'][()]
            lx,ly,lz = label.shape
            ox,oy,oz = dcm_h5[f"train/{i}/data"].shape
            label = zoom(label, (ox/lx,oy/ly,oz/lz), order=0)
            # label = smooth_obj_one_case(label)

            denoise_label = remove_small_obj_one_case(label)
            smooth_label = smooth_obj_one_case(denoise_label)

            target_h5.create_dataset(f'train/{i}/label', data=smooth_label, compression='gzip')
            for att in dcm_h5[f"train/{i}/data"].attrs:
                target_h5[f"train/{i}/label"].attrs[att] = dcm_h5[f'train/{i}/data'].attrs[att]
    target_h5.close()
    seg_h5.close()
    dcm_h5.close()


# print("process 1")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp1.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604124850-0.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp1_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)
# #
# #
# print("process 2")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp1_2.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604124850-1.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp2_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)
# # #
# # #
# print("process 3")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp1_3.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604124850-2.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp3_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)


# print("process 4")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/ACDC_segmentation_evaluation_derivate2_1/test_result-ACDC_segmentation_evaluation_derivate2_1.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604525068-2.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp4_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)
#
# print("process 5")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/ACDC_segmentation_evaluation_derivate2_2/test_result-ACDC_segmentation_evaluation_derivate2_2.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604525068-2.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp5_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)
#
# print("process 6")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/ACDC_segmentation_evaluation_derivate2_3/test_result-ACDC_segmentation_evaluation_derivate2_3.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604525068-3.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp6_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)
#
# print("process 7")
# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/ACDC_segmentation_evaluation_derivate2_4/test_result-ACDC_segmentation_evaluation_derivate2_4.h5"
# dcm_file_path = "/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data/Export-1-Dyssynchrony Project-1604525068-4.h5"
# target_seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp7_clean.h5"
# create_sax_pred(seg_file_path, dcm_file_path, target_seg_file_path)



def vis_imgs(seg_file_path):
    seg = h5py.File(seg_file_path,'r')
    for i in seg['train'].keys():
        # dcm = seg[f'train/{i}/data'][()]
        label = seg[f'train/{i}/label'][()]

        denoise_label = remove_small_obj_one_case(label)
        smooth_label = smooth_obj_one_case(denoise_label)
        for z_idx in range(label.shape[-1]):
            one_label = label[:,:,z_idx]
            smooth_one_label = smooth_label[:,:, z_idx]
            one_label = ((one_label - one_label.min())/one_label.max())*255
            smooth_one_label = ((smooth_one_label - smooth_one_label.min())/smooth_one_label.max())*255
            cv2.imwrite(f"./data/test2/save_{i}_{z_idx}_orig.png", one_label)
            cv2.imwrite(f"./data/test2/save_{i}_{z_idx}_smooth.png", smooth_one_label)


# seg_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp1.h5"
# target_file_path = "/research/cbim/vast/qc58/work/projects/pytorch-template/saved/test_results/Derivate_test/test_result-ACDC_segmentation_exp2_clean.h5"
# vis_imgs(target_file_path)


