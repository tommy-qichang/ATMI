import os
import sys
import cv2 as cv
from scipy.ndimage import filters
#import scipy.signal as signal
import numpy as np
import pylab as plb
import matplotlib.cm as cm
from itertools import product

_ALPHA = 100
_BETA = 200
_W_LINE = 250
_W_EDGE = 30
_MIN_DISTANCE = 10
_INITIAL_SMOOTH = 15
_INITIAL_ITERATIONS = 30
_ITERATIONS_DELTA = 5
_SMOOTH_FACTOR_DELTA = 4

_NUM_NEIGHBORS = 9
_MAX_SNAXELS = 10000
_INITIAL_DISTANCE_BETWEEN_SNAXELS = 50


def _gradientImage(image):
    """
    Obtain a gradient image (in both x and y directions)
    """
    gradient = np.sqrt(filters.sobel(image, 0) ** 2 + filters.sobel(image, 1) ** 2)
    gradient -= gradient.min()

    return gradient


def _inBounds(image, point):
    """
    Is the point within the bounds of the image?
    """
    return np.all(point < np.shape(image)) and np.all(point > 0)


def _externalEnergy(image, smooth_image, point):
    """
    The external energy of the point, a combination of line and edge
    """
    pixel = 255 * image[point[1]][point[0]]
    smooth_pixel = 255 * smooth_image[point[1]][point[0]]
    external_energy = (_W_LINE * pixel) - (_W_EDGE * (smooth_pixel ** 2))
    return external_energy


def _energy(image, smooth_image, current_point, next_point, previous_point=None):
    """
    Total energy (internal and external).
    Internal energy measures the shape of the contour
    """
    d_squared = np.linalg.norm(next_point - current_point) ** 2

    if previous_point is None:
        e = _ALPHA * d_squared + _externalEnergy(image, smooth_image, current_point)
        return e
    else:
        deriv = np.sum((next_point - 2 * current_point + previous_point) ** 2)
        e = 0.5 * (_ALPHA * d_squared + _BETA * deriv + _externalEnergy(image, smooth_image, current_point))
        return e


def _iterateContour(image, smooth_image, snaxels, energy_matrix, position_matrix, neighbors):
    """
    Compute the minimum energy locations for all the snaxels in the contour
    """
    snaxels_added = len(snaxels)
    for curr_idx in range(snaxels_added - 1, 0, -1):
        energy_matrix[curr_idx][:][:] = float("inf")
        prev_idx = (curr_idx - 1) % snaxels_added
        next_idx = (curr_idx + 1) % snaxels_added

        for j, next_neighbor in enumerate(neighbors):
            next_node = snaxels[next_idx] + next_neighbor

            if not _inBounds(image, next_node):
                continue

            min_energy = float("inf")
            for k, curr_neighbor in enumerate(neighbors):
                curr_node = snaxels[curr_idx] + curr_neighbor
                distance = np.linalg.norm(next_node - curr_node)

                if not _inBounds(image, curr_node) or (distance < _MIN_DISTANCE):
                    continue

                min_energy = float("inf")
                for l, prev_neighbor in enumerate(neighbors):
                    prev_node = snaxels[prev_idx] + prev_neighbor

                    if not _inBounds(image, prev_node):
                        continue

                    energy = energy_matrix[prev_idx][k][l] + _energy(image, smooth_image, curr_node, next_node,
                                                                     prev_node)

                    if energy < min_energy:
                        min_energy = energy
                        min_position_k = k
                        min_position_l = l

                energy_matrix[curr_idx][j][k] = min_energy
                position_matrix[curr_idx][j][k][0] = min_position_k
                position_matrix[curr_idx][j][k][1] = min_position_l

    min_final_energy = float("inf")
    min_final_position_j = 0
    min_final_position_k = 0

    for j in range(_NUM_NEIGHBORS):
        for k in range(_NUM_NEIGHBORS):
            if energy_matrix[snaxels_added - 2][j][k] < min_final_energy:
                min_final_energy = energy_matrix[snaxels_added - 2][j][k]
                min_final_position_j = j
                min_final_position_k = k

    pos_j = min_final_position_j
    pos_k = min_final_position_k

    for i in range(snaxels_added - 1, -1, -1):
        snaxels[i] = snaxels[i] + neighbors[pos_j]
        if i > 0:
            pos_j = position_matrix[i - 1][pos_j][pos_k][0]
            pos_k = position_matrix[i - 1][pos_j][pos_k][1]

    return min_final_energy


def activeContour(image, snaxels):
    """
    Iterate the contour until the energy reaches an equilibrium
    """
    energy_matrix = np.zeros((_MAX_SNAXELS - 1, _NUM_NEIGHBORS, _NUM_NEIGHBORS), dtype=np.float32)
    position_matrix = np.zeros((_MAX_SNAXELS - 1, _NUM_NEIGHBORS, _NUM_NEIGHBORS, 2), dtype=np.int32)
    neighbors = np.array([[i, j] for i in range(-1, 2) for j in range(-1, 2)])
    min_final_energy_prev = float("inf")

    counter = 0
    smooth_factor = _INITIAL_SMOOTH
    iterations = _INITIAL_ITERATIONS
    gradient_image = _gradientImage(image)
    # smooth_image = cv.blur(gradient_image, (smooth_factor, smooth_factor))

    while True:
        counter += 1
        if not (counter % iterations):
            iterations += _ITERATIONS_DELTA
            if smooth_factor > _SMOOTH_FACTOR_DELTA:
                smooth_factor -= _SMOOTH_FACTOR_DELTA
            # smooth_image = cv.blur(gradient_image, (smooth_factor, smooth_factor))
            # print("Deblur step, smooth factor now: ", smooth_factor)

        # _display(smooth_image, snaxels)
        min_final_energy = _iterateContour(image, gradient_image, snaxels, energy_matrix, position_matrix, neighbors)

        if (min_final_energy == min_final_energy_prev) or smooth_factor < _SMOOTH_FACTOR_DELTA:
            print("Min energy reached at ", min_final_energy)
            print("Final smooth factor ", smooth_factor)

            break
        else:
            min_final_energy_prev = min_final_energy

