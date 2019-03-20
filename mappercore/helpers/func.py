from os import path
from kmapper import KeplerMapper, Cover
import numpy as np
import sklearn

# file = path.join(path.dirname(__file__), '../../../kepler-mapper-backend-example', 'files', 'SumatranTiger.csv')
# original_data = np.genfromtxt(file, dtype=float, delimiter=',')

class RunMapper:
    def __init__(self):
        self.original_data = None
        self.data_source = None

    def run_mapper(
        self, 
        interval, 
        overlap, 
        dbscan_eps, 
        dbscan_min_samples
    ):

        # WIP: filename should be an input.
        filename = path.join(path.dirname(__file__), '../../../kepler-mapper-backend-example', 'files', 'SumatranTiger.csv')

        if filename != self.data_source:
            self.data_source = filename
            self.original_data = self._load_data(filename)

        km_result = self._call_kmapper(
            int(interval), 
            float(overlap) / 100, 
            float(dbscan_eps), 
            float(dbscan_min_samples)
        )
        return self._parse_result(km_result)


    def _call_kmapper(self, interval, overlap, eps, min_samples):

        input_data = self.original_data.copy()
        input_data /= np.max(np.max(input_data, 1))

        mapper = KeplerMapper()
        lens = mapper.fit_transform(input_data, projection=[2])
        graph = mapper.map(
            lens,
            input_data,
            clusterer=sklearn.cluster.DBSCAN(eps=eps, min_samples=min_samples),
            cover=Cover(n_cubes=interval, perc_overlap=overlap)
        )
        return graph

    def _get_median(self, cluster_points, index):
        return np.median(
            [self.original_data[p][index] for p in cluster_points]
        )

    @staticmethod
    def _load_data(filename):
        # TODO: make loader adapt to common sources (numpy saves and panda saves)

        original_data = np.genfromtxt(
            filename, 
            dtype=float, 
            delimiter=','
        )

        return original_data

    def _parse_result(self, graph):
        data = {"nodes": [], "links": []}

        # nodes
        node_keys = graph['nodes'].keys()
        name2id = {}
        i = 1
        for key in node_keys:
            name2id[key] = i
            data['nodes'].append({
                "id": str(i),
                "size": len(graph['nodes'][key]),
                "x_median": self._get_median(graph['nodes'][key], 0),
                "y_median": self._get_median(graph['nodes'][key], 1),
                "z_median": self._get_median(graph['nodes'][key], 2)
            })
            i += 1

        # links
        links = set()
        for link_from in graph['links'].keys():
            for link_to in graph['links'][link_from]:
                from_id = name2id[link_from]
                to_id = name2id[link_to]
                left_id = min(from_id, to_id)
                right_id = max(from_id, to_id)
                links.add((left_id, right_id))

        for link in links:
            data['links'].append({"source": link[0], "target": link[1]})

        return data



rm = RunMapper()
run_mapper = rm.run_mapper