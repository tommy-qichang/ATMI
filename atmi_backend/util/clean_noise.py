import numpy as np
from skimage.measure import label


class CleanNoise:
    def __init__(self, top_num=1):
        self.top_num = top_num

    def clean_small_obj(self, image):
        """
        Remove small object, just pick top_num objects for each label type.
        :param image: 2D numpy array, can extend to 3D in the future.
        :return:
        """
        connections = []
        groups, labels_num = label(image, connectivity=2, return_num=True)
        group_label_count = {}
        for i in range(1, labels_num + 1):
            num = np.sum(groups == i)
            pos = np.where(groups == i)
            label_type = image[pos[0][0], pos[1][0]]

            if label_type not in group_label_count:
                group_label_count[label_type] = []
            group_label_count[label_type].append({'group_num': i, "count": num})

        result_arr = np.zeros_like(image)
        for label_type in group_label_count:
            label_count = group_label_count[label_type]

            label_count.sort(key=lambda k: -k['count'])

            for i in range(self.top_num):
                if len(label_count) >= (i+1):
                    result_arr[groups == label_count[i]['group_num']] = label_type

        return result_arr
