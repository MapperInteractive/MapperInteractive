from .graph import Graph, EnhancedGraph
from .node import Node, EnhancedNode, Sign
import json
from os.path import join

try:
    import networkx as nx
    nx_available = True
except ImportError:
    nx_available = False

def node2compactrep(node, enhanced):
    interval_idx = node.interval_index
    cluster_idx = node.cluster_index
    s = f'Interval: {interval_idx} Cluster: {cluster_idx}'
    if enhanced:
        sign = node.sign.name.lower()
        s += f' Sign: {sign}'
    return s


def graph_to_networkx(g, enhanced=True):
    if not nx_available:
        raise ModuleNotFoundError('Networkx could not be found. This functionality is unavailable.')
    nx_g = nx.Graph()
    for n in [node2compactrep(n, enhanced=enhanced) for n in g.nodes]:
        nx_g.add_node(n, label='')
    
    nx_g.add_edges_from([(node2compactrep(n[0], enhanced=enhanced), node2compactrep(n[1], enhanced=enhanced)) for n in g.edges])
    return nx_g

def to_mapper_interactive_json(graphs, num_intervals, file_dir):
    mapper_dicts = []
    for g, num_interval in zip(graphs, num_intervals):
        mapper_dict = {'nodes': {}, 'edges': {}}
        node_to_string = {}
        for i in range(num_interval):
            nodes = g.get_interval_nodes(i)
            for j, n in enumerate(nodes):
                node_to_string[n] = f'cube{i}_cluster{j}'
                mapper_dict['nodes'][node_to_string[n]] = [int(i) for i in n.members]

        for e in g.edges:
            n1, n2 = e
            n1 = node_to_string[n1]
            n2 = node_to_string[n2]
            if n1 not in mapper_dict['edges'].keys():
                mapper_dict['edges'][n1] = []
            mapper_dict['edges'][n1].append(n2)
        mapper_dicts.append(mapper_dict)
    md = {"data": "./sample_datasets/3d-horse.csv", "overlaps": "20:20:5", "filter": "y",
     "normalization": None, "dbscan_eps": 0.3, "dbscan_numpts": 5}
    num_graphs = len(graphs)
    md['intervals'] = f'20:{num_graphs*10+10}:10'

    with open(join(file_dir, 'metadata.json'), 'w+') as fp:
        json.dump(md, fp)
    for i in range(num_graphs):
        with open(join(file_dir, f'{i*20 + 20}_20.json'), 'w+') as fp:
            json.dump(mapper_dicts[i], fp)