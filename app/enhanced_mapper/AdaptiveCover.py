import numpy as np
import numpy.linalg as LA
from typing import List, Dict, Tuple
from math import log2, log, pi
from sklearn.cluster import KMeans
import math

from .graph import Graph, AbstractGraph
from .node import Node
from .cover import Cover, UniformCover, AbstractCover, CentroidCover
from .oracle import _check_clustering_object, map_overlap_cluster_to_interval
from .mapper import generate_mapper_graph
from .converter import graph_to_networkx


def bic_centroid(X, c, assignments, BIC=True):
    k = len(c)
    d = X.shape[1]
    R = X.shape[0]
    var = 0
    log_term = 0

    # Sometimes, in sparse cases, a node gets completely split and all members join the neighbors
    empty_clusters = []
    set_assignments = set(assignments)
    for i in range(k):
        if i not in set_assignments:
            empty_clusters.append(i)

    assignments = np.asarray(assignments, dtype=np.int)
    for i in range(k):
        if i in empty_clusters:
            continue
        cluster_members = X[assignments == i]
        log_term += cluster_members.shape[0] * \
            (log(cluster_members.shape[0]) - log(R))
        var = var + np.linalg.norm(cluster_members - c[i], axis=1).sum()
    k = k - len(empty_clusters)
    var = var / (R - k)
    t2 = -1 * (R*d / 2) * log(2*pi*var)
    t3 = -1 * (1 / 2) * (R-k)
    # llh = rnlogrn - R * log(R) - ((R * d * log(2 * pi * var)) / 2) - ((d * (R-k))/(2))
    llh = log_term + t2 + t3
    # print('xmeans', llh)
    # print(rnlogrn, t2, t3, t4, var)
    if BIC:
        return llh - ((k * (d+1))/2) * log(R)  # bic
    else:
        return 2 * llh - ((k * (d + 1))) * 2  # aic


def BIC_Cover_Centroid(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer, BIC=True):
    # Returns optimal cover object, costs, num_clusters
    costs = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]
    num_clusters = []

    for interval in intervals:
        # print(interval)
        current_cover = Cover(num_intervals=interval,
                              percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        centroids, membership, _ = graph.to_hard_clustering_set(X)
        costs.append(bic_centroid(X, centroids, membership, BIC))
    return costs, intervals


def xmeans_log_likelyhood(rn, m, var, k, r):
    t1 = - (rn / 2) * log(2 * pi)
    t2 = - (rn * m / 2) * log(var)
    t3 = - (rn - k) / 2
    t4 = rn * log(rn)
    t5 = - rn * log(r)
    return t1 + t2 + t3 + t4 + t5


def get_new_centroids(X, centroid):
    new_centroids = []
    split = 2
    random_direction = np.random.random(centroid.shape)
    random_direction = random_direction / \
        np.sqrt(random_direction @ random_direction)  # normalize to unit vector
    distances = X - centroid
    magnitude = np.linalg.norm(distances, axis=1).mean()
    new_centroids.append(centroid + (random_direction * magnitude))
    new_centroids.append(centroid - (random_direction * magnitude))
    return np.asarray(new_centroids)


def assign_membership(X, centroids):
    membership = [-1 for _ in range(len(X))]
    for j in range(len(X)):
        pt = X[j]
        best_dist = np.linalg.norm(centroids[0] - pt) ** 2
        best_label = 0
        for c, centroid in enumerate(centroids):
            curr_dist = np.linalg.norm(centroid - pt) ** 2
            if best_dist > curr_dist:
                best_label = c
                best_dist = curr_dist
        membership[j] = best_label

    return np.array(membership)


def xmeans(X, centroids, iterations=1, region_iterations=1, max_k=-1, BIC=True, verbose=False):
    n_clusters = len(centroids)
    assert n_clusters != 0

    split = 2  # how much clusters to split existing clusters
    for i in range(iterations):
        current_k = len(centroids)

        # Assign current memberships
        membership = assign_membership(X, centroids)
        if verbose:
            print(
                f'iteration {i} of {iterations}. Currently {len(centroids)} clusters.')
        p = X.shape[1] + 1  # per region
        delete_centroids = []
        default_bic = np.zeros(len(centroids))
        for c in range(len(default_bic)):
            cluster_membership = X[membership == c]
            r = cluster_membership.shape[0]
            var = 0
            for member in cluster_membership:
                var += np.linalg.norm(centroids[c] - member) ** 2
            var = var / (X.shape[1] * (r - 1))
            # print(var, cluster_membership.shape, cluster_membership)
            if BIC and var != 0:
                default_bic[c] = xmeans_log_likelyhood(
                    r, X.shape[1], var, 1, r) - (p / 2) * log(r)  # bic
            elif var != 0:
                # aic
                default_bic[c] = 2 * \
                    xmeans_log_likelyhood(r, X.shape[1], var, 1, r) - (p) * 2
            else:
                print('\t encountered var 0 case')
                default_bic[c] = 0
                delete_centroids.append(c)
            if math.isnan(default_bic[c]):
                print(
                    "MAPPER: Warning - BIC computation ended up with NaN. This is usually a result of bad initial clusters.")
                default_bic[c] = 2 ** 30

        split_region = [False for _ in centroids]
        split_centroids = [None for _ in centroids]
        for c in range(len(default_bic)):
            if verbose:
                print(f'\t Region {c}')
            region_membership = X[membership == c]
            r = region_membership.shape[0]
            if r < 5:
                continue

            best_region_run = None
            for region_attempt in range(region_iterations):
                centroid_init = get_new_centroids(
                    region_membership, centroids[c])
                kmeans_obj = KMeans(n_clusters=split)
                kmeans_obj.fit(region_membership)
                new_labels = kmeans_obj.labels_
                new_centers = kmeans_obj.cluster_centers_
                new_bic = 0

                # compute variance
                var = 0
                for s in range(split):
                    cluster_membership = region_membership[new_labels == s]
                    center = new_centers[s]
                    for member in cluster_membership:
                        var += np.linalg.norm(member - center) ** 2
                var = var / (X.shape[1]*(r - split))

                for s in range(split):
                    cluster_membership = region_membership[new_labels == s]
                    rn = cluster_membership.shape[0]
                    new_bic += xmeans_log_likelyhood(
                        rn, cluster_membership.shape[1], var, split, r)
                pj = (split - 1) + split * X.shape[1] + 1
                if BIC:
                    new_bic = new_bic - (pj / 2) * log(r)  # bic
                else:
                    new_bic = 2 * new_bic - 2*pj  # aic
                if verbose:
                    print(default_bic[c], new_bic, 'current bic change')
                if default_bic[c] < new_bic and (best_region_run is None or best_region_run < new_bic):
                    best_region_run = new_bic
                    split_region[c] = True
                    split_centroids[c] = new_centers

        new_centroids = []
        for i, to_split, centroid, new_centers in zip(range(len(split_region)), split_region, centroids, split_centroids):
            if to_split and i not in delete_centroids:
                for c in new_centers:
                    new_centroids.append(c)
            elif i not in delete_centroids:
                new_centroids.append(centroid)
        centroids = np.asarray(new_centroids)
        if len(centroids) == current_k or (max_k != -1 and len(centroids) >= max_k):
            # print(f'found {len(centroids)} clusters')
            break
    return centroids


def mapper_xmeans_centroid(X, lens, initial_cover, clusterer, iterations=10, max_intervals=10, BIC=True, delta=0., method=None): 
    # Returns the best cover found
    cover = initial_cover
    num_iter = 0
    check_interval = [True for i in range(cover.num_intervals)]
    for iteration in range(iterations):
        print('iteration', iteration)
        num_iter = iteration
        modified = False
        g = generate_mapper_graph(
            X, lens, cover, clusterer, enhanced=False, refit_cover=False)
        # Determines which to split at the end
        split_interval = [False for _ in range(cover.num_intervals)]
        difference = [0 for _ in range(cover.num_intervals)]

        # Version where you just check all of the intervals in order
        if method is None or method == 'BFS':
            for i in range(cover.num_intervals):
                if not check_interval[i]:
                    continue
                # Compute the bic presplit
                interval_centers, interval_membership, interval_members = g.to_hard_clustering_set(
                    X, intervals=[i])
                if len(interval_centers) == 0:
                    continue
                old_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)

                # Generate the split
                cover.divide_interval(i)
                g_split = generate_mapper_graph(
                    X, lens, cover, clusterer, enhanced=False, refit_cover=False)
                interval_centers, interval_membership, interval_members = g_split.to_hard_clustering_set(
                    X, intervals=[i, i+1])
                if len(interval_centers) == 0:
                    cover.merge_interval(i, i+1)
                    continue

                new_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)
                if new_bic >= old_bic:
                    split_interval[i] = True
                    difference[i] = new_bic - old_bic
                    modified = True
                else:
                    check_interval[i] = False
                cover.merge_interval(i, i+1)

            if not modified:
                print(f'\tLOG: Convergence after {num_iter} iterations.')
                cover.remove_duplicate_cover_elements()
                return cover

            best_split = difference.index(max(difference))
            if split_interval[best_split] and max(difference) >= delta:
                cover.divide_interval(best_split)
                check_interval.insert(best_split+1, True)
                check_interval[best_split] = True
            else:
                cover.remove_duplicate_cover_elements()
                return cover
        elif method == 'randomized':
            all_elements_idx = [i for i in range(cover.num_intervals)]
            element_lengths = [cover[i][1] - cover[i][0]
                               for i in range(cover.num_intervals)]
            found_valid = False
            while not found_valid and len(all_elements_idx) != 0:
                # Sample one of the remaining intervals weighted by length
                weights = np.asarray(element_lengths)[all_elements_idx]
                weights = weights / weights.sum()
                current_element = int(np.random.choice(
                    np.asarray(all_elements_idx), p=weights))

                # Compute the old BIC
                interval_centers, interval_membership, interval_members = g.to_hard_clustering_set(
                    X, intervals=[current_element])
                if len(interval_centers) == 0:
                    removal_idx = all_elements_idx.index(current_element)
                    # element_lengths.pop(removal_idx)
                    all_elements_idx.pop(removal_idx)
                    continue
                old_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)

                # Generate the right split and new mapper graph
                cover.divide_interval(current_element)
                g_split = generate_mapper_graph(
                    X, lens, cover, clusterer, enhanced=False, refit_cover=False)

                # Compute the new BIC score
                interval_centers, interval_membership, interval_members = g_split.to_hard_clustering_set(
                    X, intervals=[current_element, current_element + 1])
                if len(interval_centers) == 0:
                    cover.merge_interval(current_element, current_element+1)
                    removal_idx = all_elements_idx.index(current_element)
                    # element_lengths.pop(removal_idx)
                    all_elements_idx.pop(removal_idx)
                    continue
                new_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)

                # If the split is valid, keep it
                if new_bic >= old_bic:
                    found_valid = True
                    check_interval.insert(current_element, True)
                else:
                    cover.merge_interval(current_element, current_element + 1)
                    removal_idx = all_elements_idx.index(current_element)
                    # element_lengths.pop(removal_idx)
                    all_elements_idx.pop(removal_idx)

            # If no changes are made, exit prematurely after removing duplicates
            if not found_valid:
                print(f'\tLOG: Convergence after {num_iter} iterations.')
                cover.remove_duplicate_cover_elements()
                return cover
        elif method == 'DFS':
            for i in range(cover.num_intervals):
                print(cover.num_intervals)
                print(len(check_interval))
                if not check_interval[i]:
                    continue
                # Compute the bic presplit
                interval_centers, interval_membership, interval_members = g.to_hard_clustering_set(
                    X, intervals=[i])
                if len(interval_centers) == 0:
                    continue
                old_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)

                # Generate the split
                cover.divide_interval(i)
                g_split = generate_mapper_graph(
                    X, lens, cover, clusterer, enhanced=False, refit_cover=False)
                interval_centers, interval_membership, interval_members = g_split.to_hard_clustering_set(
                    X, intervals=[i, i+1])
                if len(interval_centers) == 0:
                    cover.merge_interval(i, i+1)
                    continue

                new_bic = bic_centroid(
                    X[interval_members], interval_centers, interval_membership, BIC=BIC)
                if new_bic - old_bic >= delta:
                    # we have a good candidate and keep it
                    modified = True
                    check_interval.insert(i, True)
                    break
                else:
                    cover.merge_interval(i, i+1)

            if not modified:
                print(f'\tLOG: Convergence after {num_iter} iterations.')
                cover.remove_duplicate_cover_elements()
                return cover

        if cover.num_intervals > max_intervals:
            break

    cover.remove_duplicate_cover_elements()
    return cover


def construct_cover_from_xmeans(X, lens, initial_interval, starting_overlap, min_overlap, clusterer, iterations=10, max_k=10, BIC=True):
    # option 1 in the meeting minutes
    cov = Cover(initial_interval, starting_overlap, enhanced=False)
    g = generate_mapper_graph(X, lens, cov, clusterer, enhanced=False)
    centroids, _, _ = g.to_hard_clustering_set(X)
    final_centroids = xmeans(
        X, centroids, iterations=iterations, max_k=max_k, BIC=BIC)
    return CentroidCover(X, lens, final_centroids, min_overlap, enhanced=False)
