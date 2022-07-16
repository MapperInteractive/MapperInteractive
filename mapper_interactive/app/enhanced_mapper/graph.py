"""
Class to represent the nerve of a covering. Graph is used here to align with literature 
that calls this the "mapper graph".graph
"""
from abc import ABC, abstractmethod, abstractproperty
from enum import Enum
from typing import Dict, List, Set, Tuple

import numpy as np

from .node import EnhancedNode, Node, Sign


class AbstractGraph(ABC):
    @abstractmethod
    def add_node(self, n):
        pass

    @abstractmethod
    def add_edge(self, n1, n2):
        pass

    @abstractmethod
    def get_node(self, **kwargs):
        pass


class Graph(AbstractGraph):
    def __init__(self, verbose=False):
        super().__init__()
        self.nodes: Set[Node] = set()
        self.edges: Set[Tuple[Node, Node]] = set()
        self.verbose = verbose

    def get_node(self, interval_index: int, cluster_index: int):
        for n in self.nodes:
            if n.interval_index == interval_index and n.cluster_index == cluster_index:
                return n

    def get_interval_nodes(self, interval_index: int):
        if type(interval_index) is int:
            ret = []
            for n in self.nodes:
                if n.interval_index == interval_index:
                    ret.append(n)
        else:
            ret = []
            for n in self.nodes:
                if n.interval_index in interval_index:
                    ret.append(n)

        return ret

    def set_verbose(self, verbose):
        self.verbose = verbose

    def add_node(self, node: Node):
        self.nodes.add(node)

    def add_edge(self, node1: Node, node2: Node):
        assert (
            node1 in self.nodes and node2 in self.nodes
        ), "Attempting to add an edge to nodes that do not exist"
        self.edges.add((node1, node2))

    def to_hard_clustering_set(self, X, intervals=None):
        if intervals is None:
            all_nodes = list(self.nodes)
        else:
            all_nodes = []
            for i in intervals:
                all_nodes = all_nodes + self.get_interval_nodes(i)
        node_to_index = {node: i for i, node in enumerate(all_nodes)}
        point_indices = set()
        for i in all_nodes:
            point_indices = point_indices.union(set(i.members))
        centroids = []
        assignments = [[] for _ in range(len(X))]
        for node in all_nodes:
            members = node.members
            centroids.append(np.mean(X[members], axis=0))
            for m in members:
                assignments[m].append(node_to_index[node])

        for edge in self.edges:
            source, sink = edge
            if source not in all_nodes or sink not in all_nodes:
                continue
            source_members = source.members
            sink_members = sink.members
            intersection = list(set(source_members).intersection(set(sink_members)))
            avg_source = np.mean(X[source_members], axis=0)
            avg_sink = np.mean(X[sink_members], axis=0)
            for i in intersection:
                if np.linalg.norm(avg_source - X[i]) <= np.linalg.norm(avg_sink - X[i]):
                    if node_to_index[sink] in assignments[i]:
                        assignments[i].remove(node_to_index[sink])
                else:
                    if node_to_index[source] in assignments[i]:
                        assignments[i].remove(node_to_index[source])
        # for m in assignments:
        #     assert len(m) == 1 or len(m) == 0, "Hard clustering failed, found more than one assignment"

        final_assignments = []
        final_indicies = []
        centroids_np = np.asarray(centroids)
        for i, m in enumerate(assignments):
            if len(m) > 1:
                subset_centroids = centroids_np[m]
                final_indicies.append(i)
                final_assignments.append(
                    int(np.argmin(np.linalg.norm(subset_centroids - X[i])))
                )
            elif len(m) == 1:
                final_indicies.append(i)
                final_assignments.append(m[0])
            elif i in point_indices or intervals is None:
                final_indicies.append(i)
                final_assignments.append(
                    int(np.argmin(np.linalg.norm(centroids_np - X[i])))
                )
        return centroids, final_assignments, final_indicies

    def __repr__(self):
        s = f"Mapper Graph. {len(self.nodes)} Nodes, {len(self.edges)} Edges."
        if self.verbose:
            s += "\nNodes:\n"
            for n in self.nodes:
                s += f"\t{n}\n"
            s += "Edges:\n"
            for e in self.edges:
                s += f"\t{e[0]} -> {e[1]}\n"
        return s


class EnhancedGraph(AbstractGraph):
    def __init__(self, verbose=False):
        super().__init__()
        self.nodes: Set[EnhancedNode] = set()
        self.edges: Set[Tuple[EnhancedNode, EnhancedNode]] = set()
        self.function: Dict[EnhancedNode, float] = dict()
        self.verbose = verbose

    def get_node(self, interval_index: int, cluster_index: int, sign: Sign):
        for n in self.nodes:
            if (
                n.interval_index == interval_index
                and n.cluster_index == cluster_index
                and n.sign == sign
            ):
                return n

    def set_verbose(self, verbose):
        self.verbose = verbose

    def add_node(self, node: EnhancedNode):
        self.nodes.add(node)

    def add_edge(self, node1: EnhancedNode, node2: EnhancedNode):
        assert (
            node1 in self.nodes and node2 in self.nodes
        ), "Attempting to add an edge to nodes that do not exist"
        if (node1, node2) not in self.edges and (node2, node1) not in self.edges:
            self.edges.add((node1, node2))

    def set_function_val(self, node: EnhancedNode, val: float):
        assert (
            node in self.nodes
        ), "Attempting to set a function value for a nonexist node"
        self.function[node] = val

    def __repr__(self):
        s = f"Enhanced Mapper Graph. {len(self.nodes)} Nodes, {len(self.edges)} Edges."
        if self.verbose:
            s += "\nNodes:\n"
            for n in self.nodes:
                s += f"\t{n}\n"
            s += "Edges:\n"
            for e in self.edges:
                s += f"\t{e[0]} -> {e[1]}\n"
            s += "Function: \n"
            for k in self.function.keys():
                s += f"\t{k} -> {self.function[k]}\n"
        return s
