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

def adaptive_cover_graph(X: np.ndarray, lens: np.ndarray, cover: Cover, clusterer: object, per_interval_aggregator):
    # Quick checks to fail if input is malformed
    _check_clustering_object(clusterer)
    if len(lens.shape) == 2:
        assert lens.shape[1] == 1, 'Only 1D mapper is supported!'
        lens = lens.reshape(-1)

    interval_clusterings: List[List[int]] = []
    graph: Graph = Graph()
    interval_clusterings = []
    graph_loss = 0

    for i, interval_members in enumerate(cover.fit_intervals(lens)):
        interval_clusterings.append([])
        if len(interval_members) == 0:
            continue
        assignments: np.ndarray = clusterer.fit_predict(X[interval_members])
        graph_loss += per_interval_aggregator(X[interval_members], assignments, clusterer)
        num_clusters: int = assignments.max() + 1  # if 3 is a cluster, then there are 4 clusters: see dbscan sklearn docs

        for cluster in range(num_clusters):
            cluster_members = interval_members[assignments == cluster]
            interval_clusterings[i].append(cluster_members)
            if len(cluster_members) == 0:
                continue
            node = Node(i, cluster, cluster_members)
            graph.add_node(node)
            if i > 0:  # beyond first interval
                lower_interval_clusters = interval_clusterings[i - 1]
                map_down = map_overlap_cluster_to_interval(cluster_members, lower_interval_clusters)
                for down in map_down:
                    node2 = graph.get_node(i - 1, down)
                    graph.add_edge(node, node2)

    return len(graph.nodes), graph_loss

def compute_centroids(X, graph):
    hard_cluster = graph.to_hard_clustering_set(X)
    n_clusters = len(graph.nodes)
    centroids = []
    dists = 0
    for c in range(n_clusters):
        members = [i for i, val in enumerate(hard_cluster) if val == c]
        centroid = np.mean(X[members], axis=0)
        for m in members:
            dists += np.linalg.norm(centroid - X[m])
        centroids.append(centroid)
    for m, val in enumerate(hard_cluster):
        if val == -1 and len(centroids) != 0:
            min_dist = np.linalg.norm(centroids[0] - X[m]) ** 2
            for centroid in centroids:
                min_dist = min(min_dist, np.linalg.norm(centroid - X[m]) )
            dists += min_dist

    return centroids, dists


def AIC_Cover_Centroid(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    print("DEPRECATED - INCORRECT AIC CALCULATION")
    # Returns optimal cover object, costs, num_clusters
    costs = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]
    num_clusters = []

    def _aic(p, llh):
        return 2* p - 2 * llh

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        n_clusters = len(graph.nodes)
        num_clusters.append(n_clusters)
        centroids, var = compute_centroids(X, graph)
        k = len(centroids)
        var = var / (X.shape[0] - k)
        p = (k-1) + (k * X.shape[1]) + 1
        membership = assign_membership(X, centroids)
        llh = 0
        for c in range(len(centroids)):
            cluster_membership = X[membership == c]
            if cluster_membership.shape[0] == 0:
                continue
            llh += xmeans_log_likelyhood(cluster_membership.shape[0], X.shape[1], var, k, X.shape[0])
        costs.append(_aic(p, llh))
    return costs, intervals

def AIC_normal_pdf(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    costs = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)

        cost = 0
        nodes = list(graph.nodes)
        max_vals = [lens[n.members].max() for n in nodes]
        min_vals = [lens[n.members].min() for n in nodes]
        counts = [len(n.members) for n in nodes]
        for i in range(X.shape[0]):
            function_value = lens[i]
            C_y = 0
            for ub, lb, c in zip(max_vals, min_vals, counts):
                if ub >= function_value and lb <= function_value:
                    C_y += c
            if C_y != 0:
                cost = cost + log2(C_y)
        cost = cost - len(graph.nodes) * 3
        costs.append(cost)
    return costs, intervals

def BIC_normal_pdf(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    costs = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)

        cost = 0
        nodes = list(graph.nodes)
        max_vals = [lens[n.members].max() for n in nodes]
        min_vals = [lens[n.members].min() for n in nodes]
        counts = [len(n.members) for n in nodes]
        for i in range(X.shape[0]):
            function_value = lens[i]
            C_y = 0
            for ub, lb, c in zip(max_vals, min_vals, counts):
                if ub >= function_value and lb <= function_value:
                    C_y += c
            if C_y != 0:
                cost = cost + log2(C_y)
        cost = cost - len(graph.nodes) * 3 * log2(X.shape[0])
        costs.append(cost)
    return costs, intervals

def Adj_Entropy(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer, weighted=True):
    entropies = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        edges = list(graph.edges)
        probabilities = []
        for e in edges:
            n1, n2 = e
            n1 = n1.members
            n2 = n2.members
            if weighted:
                probabilities.append(len(set(n1).intersection(set(n2))))
            else:
                probabilities.append(1)
        probabilities = np.asarray(probabilities)
        probabilities = probabilities / probabilities.sum()
        entropy = 0
        for p in probabilities:
            entropy = entropy + p * log2(p)
        entropy = entropy * -1
        entropies.append(entropy)
    return entropies, intervals

def Adj_Entropy_Pointwise(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer, weighted=True):
    entropies = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        print(interval)
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        edges = list(graph.edges)
        probabilities = np.zeros((X.shape[0], X.shape[0]))
        total_weight = 0
        for e in edges:
            n1, n2 = e
            n1 = n1.members
            n2 = n2.members
            weight = len(set(n1).intersection(set(n2))) if weighted else 1
            unique_n1 = list(set(n1).difference(set(n2)))
            unique_n2 = list(set(n2).difference(set(n1)))
            for m in unique_n2:
                probabilities[unique_n1, m] = weight
                total_weight = total_weight + weight * len(unique_n1)

        probabilities = probabilities.flatten()
        probabilities = probabilities[probabilities.nonzero()]
        probabilities = probabilities / probabilities.sum()
        entropy = 0
        for p in probabilities:
            entropy = entropy + p * log2(p)
        entropy = entropy * -1
        entropies.append(entropy)
    return entropies, intervals

def KL_adj(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    divergences = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]
    prev = None
    current = None
    def _kl(a, b):
        entropy = 0
        for i in range(a.shape[0]):
            for j in range(i, a.shape[0]):
                if a[i][j] != 0 and b[i][j] != 0:
                    entropy = entropy + a[i][j] * log2(b[i][j] / a[i][j])
        return entropy * -1

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        edges = list(graph.edges)
        probabilities = np.zeros((X.shape[0], X.shape[0]))
        total_weight = 0
        for e in edges:
            n1, n2 = e
            n1 = n1.members
            n2 = n2.members
            weight = len(set(n1).intersection(set(n2)))
            for m in n2:
                probabilities[n1, m] = 1
                # total_weight = total_weight + weight * len(n1)
                total_weight = total_weight + len(n1)
        probabilities = probabilities / total_weight
        if current is None:
            current = probabilities
        else:
            prev = current
            current = probabilities
            divergences.append(_kl(prev, current))
    return divergences, intervals

def f_Entropy(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    entropies = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        edges = list(graph.edges)
        total = 0
        for n in graph.nodes:
            total += len(n.members)

        probabilities = []
        nodes = list(graph.nodes)
        max_vals = [lens[n.members].max() for n in nodes]
        min_vals = [lens[n.members].min() for n in nodes]
        counts = [len(n.members) for n in nodes]
        for i in range(X.shape[0]):
            function_value = lens[i]
            C_y = 0
            for ub, lb, c in zip(max_vals, min_vals, counts):
                if ub >= function_value and lb <= function_value:
                    C_y += c
            if C_y != 0:
                probabilities.append(C_y)
        entropy = 0
        probabilities = np.asarray(probabilities)
        probabilities = probabilities / probabilities.sum()
        for p in probabilities:
            entropy = entropy + p * log2(p)
        entropy = entropy * -1
        entropies.append(entropy)
    return entropies, intervals


def f_unique_Entropy(X, lens, perc_overlap, min_intervals, max_intervals, interval_step, clusterer):
    entropies = []
    intervals = [i for i in range(min_intervals, max_intervals, interval_step)]

    for interval in intervals:
        current_cover = Cover(num_intervals=interval, percent_overlap=perc_overlap, enhanced=False)
        graph = generate_mapper_graph(X, lens, current_cover, clusterer)
        edges = list(graph.edges)
        total = X.shape[0]
        probabilities = []
        nodes = list(graph.nodes)
        max_vals = [lens[n.members].max() for n in nodes]
        min_vals = [lens[n.members].min() for n in nodes]
        for i in range(X.shape[0]):
            function_value = lens[i]
            mem = []
            for ub, lb, n in zip(max_vals, min_vals, nodes):
                if ub >= function_value and lb <= function_value:
                    mem = mem + n.members.tolist()
            if len(mem) != 0:
                probabilities.append(len(set(mem)))
        entropy = 0
        probabilities = np.asarray(probabilities)
        probabilities = probabilities / probabilities.sum()
        for p in probabilities:
            entropy = entropy + p * log2(p)
        entropy = entropy * -1
        entropies.append(entropy)
    return entropies, intervals
