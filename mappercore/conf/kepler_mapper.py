import numpy as np
from sklearn import cluster
from kmapper import KeplerMapper, Cover

__all__ = ['KeplerMapperConfig']


class KeplerMapperConfig:

    def configure(self, server):
        server.register_function('run_mapper', self.run_mapper)
        server.set_js_initializer(self._js_initializer)
        server.set_user_specs(self._user_config)

    def __init__(self, data=None, lens=None, config=None):

        # KM specific interface configurations
        self._js_initializer = 'conf/KeplerMapperConf'
        self._user_config = config

        self._data = data
        self._lens = lens

        self._mapper = KeplerMapper()

    def set_data(self, data):
        self._data = data
        return self

    def set_lens(self, lens):
        self._lens = lens
        return self

    @property
    def mapper(self):
        return self._mapper

    def run_mapper(self, interval, overlap, dbscan_eps, dbscan_min_samples, filter_function):
        km_result = self._call_kmapper(
            int(interval),
            float(overlap) / 100,
            float(dbscan_eps),
            float(dbscan_min_samples),
            filter_function
        )
        return self._parse_result(km_result)

    def _call_kmapper(self, interval, overlap, eps, min_samples, filter_function):
        mapper = KeplerMapper()

        data = self._generate_data()
        lens = mapper.project(data, projection=filter_function)

        graph = mapper.map(
            lens, data,
            clusterer=cluster.DBSCAN(eps=eps, min_samples=min_samples),
            cover=Cover(n_cubes=interval, perc_overlap=overlap)
        )

        return graph

    def _generate_data(self):
        if self._data is None:
            raise RuntimeError("No data or a function to generate the data.")

        return self._data if not callable(self._data) else self._data.copy()

    def _generate_lens(self):
        if self._lens is None:
            raise RuntimeError("No lens or a function to generate the lens.")

        return self._lens if not callable(self._lens) else self._lens.copy()

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
