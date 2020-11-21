import os

import h5py

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
    for file in files:
        h5_file = h5py.File(os.path.join(root_path, file),'r')
        print(f"process file:{file}")
        keys = h5_file['train'].keys()
        for key in keys:
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

filter_all_series("/research/cbim/vast/qc58/private-db/cardiac/derivate_export_data",['Export-1-Dyssynchrony Project-1604124850-0.h5','Export-1-Dyssynchrony Project-1604124850-1.h5','Export-1-Dyssynchrony Project-1604124850-2.h5','Export-1-Dyssynchrony Project-1604525068-2.h5','Export-1-Dyssynchrony Project-1604525068-3.h5','Export-1-Dyssynchrony Project-1604525068-4.h5','Export-1-Dyssynchrony Project-1604525068-5.h5'],"DyssynchronyProjectDcmFiltered-LAX-Nov16.h5","lax")

