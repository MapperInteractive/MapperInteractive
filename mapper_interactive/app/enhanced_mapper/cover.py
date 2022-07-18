import math
from abc import ABC, abstractmethod
from functools import cmp_to_key

import numpy as np
from sklearn.metrics import pairwise_distances


class AbstractCover(ABC):
    num_intervals = None
    percent_overlap = None
    enhanced = None
    fitted = None
    intervals = None
    interval_mapping = None
    overlaps = None
    overlap_mapping = None

    @abstractmethod
    def compute_intervals(
        self, bound_min: int, bound_max: int, lens: np.ndarray = None
    ):
        pass

    def fit_intervals(self, lens: np.ndarray):
        # Lens must be shaped (N,) np array
        if not self.fitted:
            self.compute_intervals(np.min(lens), np.max(lens), lens)

        indices = np.arange(len(lens))

        for interval in self.intervals:
            bound_min = interval[0]
            bound_max = interval[1]
            yield indices[(bound_min <= lens) & (lens <= bound_max)]

    def fit_overlaps(self, lens: np.ndarray):
        # Generator bodies are not run when created. Exception will only occur when looping.
        if not self.enhanced:
            raise AttributeError("Cover was not set to enhanced mapper cover.")

        # Lens must be shaped (N,) np array
        if not self.fitted:
            self.compute_intervals(np.min(lens), np.max(lens), lens)

        indices = np.arange(len(lens))

        for overlap in self.overlaps:
            # end of the lower interval
            bound_max = self.intervals[overlap[0]][1]
            # beginning of the next interval
            bound_min = self.intervals[overlap[1]][0]
            yield indices[(bound_min <= lens) & (lens <= bound_max)]

    def force_refit(self):
        self.fitted = False

    def __getitem__(self, key):
        """
        Get interval indexed by key. Does not check bounds.
        """
        if not self.fitted:
            raise AttributeError()
        return self.intervals[key]

    def divide_interval(self, idx):
        # Splits an interval in 2
        # print('split', idx)
        if self.enhanced:
            raise NotImplementedError()
        intervals_list = self.intervals.tolist()
        interval = intervals_list[idx]
        end = interval[1]
        len = interval[1] - interval[0]
        new_len = len / (2 - self.percent_overlap)
        interval[1] = interval[0] + new_len
        intervals_list.insert(idx + 1, [end - new_len, end])
        self.intervals = np.asarray(intervals_list)
        self.num_intervals += 1

    def merge_interval(self, i, j):
        # Merges 2 intervals
        # print('merge', i, j)
        if self.enhanced:
            raise NotImplementedError()
        assert (
            j == i + 1 and j < self.intervals.shape[0] and i < self.intervals.shape[0]
        )
        intervals_list = self.intervals.tolist()
        end = intervals_list[j][1]
        start = intervals_list[i][0]
        intervals_list.pop(j)
        intervals_list[i][0] = start
        intervals_list[i][1] = end
        self.num_intervals -= 1
        self.intervals = np.asarray(intervals_list)

    def remove_duplicate_cover_elements(self):
        # Sort the cover elements by starting element
        intervals_list = self.intervals.tolist()

        def c(a, b):
            if a[0] < b[0]:
                return -1
            elif a[0] == b[0]:
                if a[1] > b[1]:
                    return -1
                elif a[1] < b[1]:
                    return 1
                else:
                    return 0
            else:
                return 1

        intervals_list.sort(key=cmp_to_key(c))
        marked_for_deletion = []
        for i in range(len(intervals_list)):
            for j in range(i + 1, len(intervals_list)):
                a = intervals_list[i]
                b = intervals_list[j]
                # exact case:
                if a[0] == b[0] and a[1] == b[1]:
                    marked_for_deletion.append(b)
                # Contained case
                elif a[0] <= b[0] and a[1] >= b[1]:
                    marked_for_deletion.append(b)
        print(f"Deleted {len(marked_for_deletion)} intervals")
        for d in marked_for_deletion:
            if d in intervals_list:  # Might have duplicates due to numerical quirks
                intervals_list.remove(d)

        self.intervals = np.asarray(intervals_list)
        self.fitted = True
        self.num_intervals = len(intervals_list)


class Cover(AbstractCover):
    def __init__(
        self, num_intervals: int, percent_overlap: float, enhanced: bool = False
    ):
        assert (
            num_intervals > 1 and percent_overlap > 0 and percent_overlap < 1
        ), "Bad params for Cover."
        self.num_intervals, self.percent_overlap, self.enhanced = (
            num_intervals,
            percent_overlap,
            enhanced,
        )
        self.intervals, self.interval_mapping = None, None
        self.fitted = False
        self.enhanced = enhanced
        if self.enhanced:
            self.overlaps, self.overlap_mapping = None, None

    def compute_intervals(
        self, bound_min: float, bound_max: float, lens: np.ndarray = None
    ):
        self.fitted = True
        total_length: float = bound_max - bound_min

        # Total length = num_cover * length_each_cover_element * (1-percent_overlap) + length_each_cover_element * percent_overlap
        # => interval_length = total / (n*(1-p) + p)
        interval_length: float = total_length / (
            self.num_intervals * (1 - self.percent_overlap) + self.percent_overlap
        )

        # Amount overlap in absolute value terms
        overlap_length: float = interval_length * self.percent_overlap

        # Num intervals x 2 - bounds intervals
        intervals: np.ndarray = np.zeros((self.num_intervals, 2))
        start_of_interval: float = 0.0
        for i in range(self.num_intervals):
            end_of_interval: float = start_of_interval + interval_length
            intervals[i][0], intervals[i][1] = start_of_interval, end_of_interval
            start_of_interval = end_of_interval - overlap_length

        if self.enhanced:
            overlaps: np.ndarray = np.zeros((self.num_intervals - 1, 2))
            for i in range(1, self.num_intervals):
                overlaps[i - 1][0] = i - 1
                overlaps[i - 1][1] = i

        # Reposition at the start of bounds
        intervals += bound_min

        self.intervals = intervals
        if self.enhanced:
            self.overlaps = overlaps.astype(int)


class UniformCover(AbstractCover):
    """
    Ensures each interval has an equal number of points.
    """

    def __init__(
        self, num_intervals: int, percent_overlap: float, enhanced: bool = False
    ):
        assert (
            num_intervals > 1 and percent_overlap > 0 and percent_overlap < 1
        ), "Bad params for Cover."
        self.num_intervals, self.percent_overlap, self.enhanced = (
            num_intervals,
            percent_overlap,
            enhanced,
        )
        self.intervals, self.interval_mapping = None, None
        self.fitted = False
        self.enhanced = enhanced
        self.sorted_lens_idx = None
        if self.enhanced:
            self.overlaps, self.overlap_mapping = None, None

    def force_refit(self):
        self.fitted = False

    def compute_intervals(self, bound_min: float, bound_max: float, lens: np.ndarray):
        # Compute total number of points
        assert lens.shape[0] != 0, "You need at least one point in the lens function."
        self.fitted = True
        num_pts = lens.shape[0]

        # Compute points per interval and overlap
        self.sorted_lens_idx = np.argsort(lens.flatten())
        sorted_lens = lens.flatten()[self.sorted_lens_idx]
        points_per_interval = num_pts / (
            self.num_intervals - ((self.num_intervals - 1) * self.percent_overlap)
        )
        # Round both since we can't have a fraction of a point
        points_per_overlap = math.floor(self.percent_overlap * points_per_interval)
        points_per_interval = math.floor(points_per_interval)
        self.intervals: np.ndarray = np.zeros((self.num_intervals, 2))
        idx = 0
        for i in range(self.num_intervals - 1):
            self.intervals[i][0] = sorted_lens[idx]
            idx = idx + points_per_interval
            self.intervals[i][1] = sorted_lens[idx]
            idx = idx - points_per_overlap
        self.intervals[-1][0] = sorted_lens[idx]
        self.intervals[-1][1] = sorted_lens[-1]


class CentroidCover(AbstractCover):
    def __init__(self, X, lens, centroids, percent_overlap, enhanced=False):
        self.centroids = centroids
        self.percent_overlap = percent_overlap
        self.enhanced = enhanced
        self.fitted = True
        self._generate_cover_from_centroids(X, lens, centroids)

    def _remove_duplicate_intervals(self, cluster_intervals):
        marked_for_deletion = []

        # Remove duplicate and contained intervals
        for i in range(len(cluster_intervals)):
            for j in range(i + 1, len(cluster_intervals)):
                a = cluster_intervals[i]
                b = cluster_intervals[j]
                # exact case:
                if a[0] == b[0] and a[1] == b[1]:
                    marked_for_deletion.append(b)
                # Contained case
                elif a[0] <= b[0] and a[1] >= b[1]:
                    marked_for_deletion.append(b)
        for d in marked_for_deletion:
            if d in cluster_intervals:  # Might have duplicates due to numerical quirks
                cluster_intervals.remove(d)
        return cluster_intervals

    def _ensure_min_overlap(self, cluster_intervals, min_overlap):
        for i in range(len(cluster_intervals) - 1):
            a = cluster_intervals[i]
            b = cluster_intervals[i + 1]
            a_len = a[1] - a[0]
            b_len = b[1] - b[0]
            total_length = b[1] - a[0]
            modified = None
            length = None
            other_length = None
            if a_len >= b_len:
                modified = b
                length = b_len
                other_length = a_len
            else:
                modified = a
                length = a_len
                other_length = b_len
            extension = (
                total_length - length - other_length + min_overlap * length
            ) / (1 - min_overlap)
            if modified == b:
                modified[0] = modified[0] - extension
            else:
                modified[1] = modified[1] + extension

        return cluster_intervals

    def _generate_cover_from_centroids(self, X, lens, centroids):
        centroids = np.asarray(centroids)
        distance_mat = pairwise_distances(X, centroids) ** 2
        assignments = np.argmin(distance_mat, axis=1)
        cluster_intervals = []
        for c in range(len(centroids)):
            cluster_members = lens[assignments == c]
            cluster_intervals.append([cluster_members.min(), cluster_members.max()])

        def c(a, b):
            if a[0] < b[0]:
                return -1
            elif a[0] == b[0]:
                if a[1] > b[1]:
                    return -1
                elif a[1] < b[1]:
                    return 1
                else:
                    return 0
            else:
                return 1

        cluster_intervals.sort(key=cmp_to_key(c))
        cluster_intervals = self._remove_duplicate_intervals(cluster_intervals)
        cluster_intervals = self._ensure_min_overlap(
            cluster_intervals, self.percent_overlap
        )
        self.intervals = cluster_intervals
        self.num_intervals = len(cluster_intervals)

    def compute_intervals(
        self, bound_min: int, bound_max: int, lens: np.ndarray = None
    ):
        pass
