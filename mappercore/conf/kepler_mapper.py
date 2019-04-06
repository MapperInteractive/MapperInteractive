import numpy as np
from sklearn import cluster
from kmapper import KeplerMapper, Cover

__all__ = ['KeplerMapperConfig']


class KeplerMapperConfig:

    def setup(self, server):
        server.register_function('kepler_mapper', lambda **kwargs: self.run(**kwargs))

    def __init__(self, data=None, target=None):
        self._data = np.array(data)
        self._target = np.array(target)
        self._mapper = KeplerMapper()

    def run(self, interval, overlap, dbscan_eps, dbscan_min_samples):
        km_result = self._call_kmapper(
            int(interval),
            float(overlap) / 100,
            float(dbscan_eps),
            float(dbscan_min_samples)
        )
        return self._parse_result(km_result)

    def set_data(self, data):
        self._data = data

    def set_target(self, target):
        self._target = target

    @property
    def mapper(self):
        return self._mapper

    def _call_kmapper(self, interval, overlap, eps, min_samples):

        input_data = self._data.copy()
        # input_data /= np.max(np.max(input_data, 1))

        target_data = self._target.copy()

        mapper = KeplerMapper()
        graph = mapper.map(
            target_data,
            input_data,
            clusterer=cluster.DBSCAN(eps=eps, min_samples=min_samples),
            cover=Cover(n_cubes=interval, perc_overlap=overlap)
        )

        return graph

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
