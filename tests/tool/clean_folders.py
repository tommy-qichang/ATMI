import os
import re
import shutil

import pydicom


def fast_scandir(dirname):
    """
    Only get all root folders.
    :param dirname:
    :return:
    """
    rootfolders = []
    subfolders= [f.path for f in os.scandir(dirname) if f.is_dir()]
    if len(subfolders)>0:
        for dirname in list(subfolders):
            rootfolders.extend(fast_scandir(dirname))
    else:
        rootfolders.append(dirname)
    return rootfolders

def is_qualified_dicom(file):
    if re.search('/dicom|\.dcm|/im', file, re.IGNORECASE):
        return True
    return False

def clean_folder(dirname):
    print(f"Start clean folder:{dirname}")
    root_folders = fast_scandir(dirname)
    clean_targets = []
    for folder in root_folders:
        qualify_files = [file for file in os.scandir(folder) if is_qualified_dicom(os.path.join(folder, file))]
        if len(qualify_files)<=10:
            clean_targets.append(folder)
            continue
        try:
            qualify_file = qualify_files[0]
            dcm_file = pydicom.read_file(os.path.join(folder, qualify_file))
            desc = dcm_file.SeriesDescription.lower()
            matches = ['sax', 'lax', 'b-tfe', 'cine', 'funzione', 'secondarycapture']
            exclude_matches = ['tag']

            if (not any(x in desc for x in matches)) or (any(y in desc for y in exclude_matches)):
                print(f"Exclude unqualified series:{folder}, with description: {desc}")
                clean_targets.append(folder)
                continue

            dcm_img = dcm_file.pixel_array
            dcm_shape = dcm_img.shape
            if (len(dcm_shape) > 2):
                print(f"Exclude color series:{folder}")
                clean_targets.append(folder)
                continue

        except AttributeError as err:
            clean_targets.append(folder)
            print(err)
            # pass

    print(clean_targets)
    for idx, target in enumerate(clean_targets):
        move_target = target.replace("derivate/","derivate/tmp/")
        print(f"Move folder to:{move_target}({idx}/{len(clean_targets)})")
        shutil.move(target, move_target)
        # shutil.rmtree(target)

# find . -depth -empty -type d -exec rmdir {} \;

clean_folder("/research/cbim/vast/qc58/private-db/cardiac/derivate/Derivate1")
