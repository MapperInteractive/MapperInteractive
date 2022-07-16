"""
Oracles for the mapper algorithm. 
- First oracle maps intervals to clusters. 
- Second oracle maps overlap cluster to interval cluster.
"""

from typing import List

import numpy as np
import sklearn
from sklearn.metrics import pairwise_distances


def _check_clustering_object(clustering_obj: object):
    if not callable(getattr(clustering_obj, "fit_predict")):
        raise AttributeError()
    else:
        return True


def cluster_points(X: np.ndarray, clustering_obj: object):
    """This is pi in the paper."""

    # c = sklearn.base.clone(clustering_obj)
    # c.metric = 'precomputed'
    # c.n_jobs = 1
    # dist_mat = pairwise_distances(x, 2)
    return clustering_obj.fit_predict(X)


def map_overlap_cluster_to_interval(
    cluster_members: List[int], interval_cluster_membership: List[List[int]]
):
    """This is rho in the paper."""
    cluster_members_set = set(cluster_members)
    intersect = []
    for i in range(len(interval_cluster_membership)):
        if (
            len(set(interval_cluster_membership[i]).intersection(cluster_members_set))
            > 0
        ):
            intersect.append(i)
    return intersect
