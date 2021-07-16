import os

import h5py
import re
from atmi_backend.util.utils import is_qualified_series


def filter_all_series(root_path, files, target, filter_type='lax'):
    """
    Get all files and filter them as sax or lax. And combine them together.
    :param root_path:
    :param files:
    :param type:
    :return:
    """
    assert type(files) is list, "the files should be a list with all source files"
    data_collection = {}
    annotated_cases = ["1.2.840.113619.2.248.116523898912.30332.1518679612060.2","1.2.840.113619.2.248.116523898912.10767.1518690709586.2","1.2.840.113619.2.248.116523898912.24930.1518687441413.2","1.2.840.113619.2.248.116523898912.23631.1518684671031.2","1.2.840.113619.2.248.116523898912.24406.1518791396259.2","1.2.840.113619.2.248.116523898912.8803.1518682498134.2","1.2.840.113619.2.248.116523898912.5084.1518685449070.2","1.2.840.113619.2.248.116523898912.10738.1518693680065.2","1.2.840.113619.2.248.116523898912.16942.1518678805381.2","1.2.840.113619.2.248.116523898912.22595.1518684601276.2","1.2.840.113619.2.248.116523898912.9140.1518693605695.2","1.2.840.113619.2.248.116523898912.19841.1518679003979.2","1.2.840.113619.2.248.116523898912.5729.1518790777440.2","1.2.840.113619.2.248.116523898912.15284.1518696272799.2","1.2.840.113619.2.248.116523898912.2065.1518790581903.2","1.2.840.113619.2.234.116521852188.6857.1519061505958.2","1.2.840.113619.2.248.116523898912.30635.1518697435052.2","1.2.840.113619.2.248.116523898912.7396.1518680200617.2","1.2.840.113619.2.248.116523898912.12959.1518682652006.2","1.2.840.113619.2.234.116521852188.13177.1519062257326.2","1.2.840.113619.2.248.116523898912.22589.1518692459045.2","1.2.840.113619.2.234.116521852188.14886.1519062535920.2","1.2.840.113619.2.248.116523898912.16737.1518684347458.2","1.2.840.113619.2.248.116523898912.19194.1518694180716.2","1.2.840.113619.2.248.116523898912.9775.1518695980508.2","1.2.840.113619.2.234.116521852188.16287.1519062707113.2","1.2.840.113619.2.248.116523898912.26117.1518679386848.2","1.2.840.113619.2.234.116521852188.18925.1519063123861.2","1.2.840.113619.2.248.116523898912.2346.1518695406979.2","1.2.840.113619.2.248.116523898912.31633.1518679769288.2","1.2.840.113619.2.248.116523898912.25079.1518679319096.2","1.2.840.113619.2.248.116523898912.13590.1518680533517.2","1.2.840.113619.2.234.116521852188.20446.1519063400038.2","1.2.840.113619.2.248.116523898912.13197.1518690965532.2","1.2.840.113619.2.248.116523898912.31261.1518790433996.2","1.2.840.113619.2.248.116523898912.16355.1518696330640.2","1.2.840.113619.2.248.116523898912.23024.1518790035924.2","1.2.840.113619.2.248.116523898912.8276.1518685639332.2","1.2.840.113619.2.248.116523898912.31659.1518695180078.2","1.2.840.113619.2.248.116523898912.5119.1518690278031.2","1.2.840.113619.2.248.116523898912.27149.1518679441714.2","1.2.840.113619.2.248.116523898912.3423.1518695475516.2"]
    for file in files:
        h5_file = h5py.File(os.path.join(root_path, file),'r')
        print(f"process file:{file}")
        keys = h5_file['train'].keys()
        for key in keys:
            study_id = re.split(':|-', key)[1]
            if study_id in annotated_cases:
                continue
            data = h5_file[f"train/{key}/data"][()]
            attrs = list(h5_file[f"train/{key}/data"].attrs.items())
            desc = h5_file[f"train/{key}/data"].attrs['description']
            if is_qualified_series(filter_type, desc):
                print(f"item:{key}, with desc:{desc} is qualified.")
                data_collection[key] = {"data":data, "attrs":attrs}

    h5_target = h5py.File(os.path.join(root_path, target),'w')
    for key in data_collection:
        print(f"Start save key:{key}")
        collect = data_collection[key]["data"]
        attrs = data_collection[key]["attrs"]
        record = h5_target.create_dataset(f"train/{key}/data", data=collect, compression='gzip')
        for attr_tuple in attrs:
            record.attrs[attr_tuple[0]] = attr_tuple[1]

    h5_target.close()

# filter_all_series("/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data",['Export-1-Dyssynchrony Project-1604124850-0.h5','Export-1-Dyssynchrony Project-1604124850-1.h5','Export-1-Dyssynchrony Project-1604124850-2.h5','Export-1-Dyssynchrony Project-1604525068-2.h5','Export-1-Dyssynchrony Project-1604525068-3.h5','Export-1-Dyssynchrony Project-1604525068-4.h5','Export-1-Dyssynchrony Project-1604525068-5.h5'],"DyssynchronyProjectDcmFiltered-LAX-Nov16.h5","lax")

filter_all_series("/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data",['Export-1-Dyssynchrony Project-1604124850-0.h5','Export-1-Dyssynchrony Project-1604124850-1.h5','Export-1-Dyssynchrony Project-1604124850-2.h5','Export-1-Dyssynchrony Project-1604525068-2.h5','Export-1-Dyssynchrony Project-1604525068-3.h5','Export-1-Dyssynchrony Project-1604525068-4.h5','Export-1-Dyssynchrony Project-1604525068-5.h5'],"DyssynchronyProjectDcmFiltered-lax-apr18.h5","lax")
