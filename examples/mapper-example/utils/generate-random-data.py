import json
from itertools import product
from os import path, chdir, listdir, unlink
from random import randint, uniform
from sys import argv

# cd to current directory
chdir(path.dirname(path.abspath(__file__)))

# remove current files
DATA_DIR = "../files"
for file_name in listdir(DATA_DIR):
    file_path = path.join(DATA_DIR, file_name)
    try:
        if path.isfile(file_path):
            unlink(file_path)
    except Exception as e:
        print(e)

OVERLAP_MAX = 55
PARAM_A_RANGE = range(10, 100, 10)
PARAM_B_RANGE = range(10, 95, 5)
PARAM_C_RANGE = range(5, OVERLAP_MAX, 5)
PARAM_RANGE_MAX_SUM = 100 + 95 + OVERLAP_MAX


def random_node_number(params):
    max_node_limit = 100
    node_number_seed = (1 - params[2] / OVERLAP_MAX) * max_node_limit
    return int(uniform(node_number_seed / 2, node_number_seed))


def random_edges(node_number):
    edge_number = min(
        randint(int(node_number / 2), int(node_number)),  # random number between N/3 and 2N/3
        int(node_number * (node_number - 1))  # max number of edges in a graph
    )
    edges = set()

    while len(edges) < edge_number:
        a = randint(1, node_number)
        b = randint(1, node_number)
        if a != b:
            edges.add((a, b))

    return edges


def write_data_file(params, node_number, edges, file):
    data = {"links": [], "nodes": []}

    def random_func(node_id):
        return uniform(color_random_param / 3, color_random_param) / PARAM_RANGE_MAX_SUM * (node_number - node_id)

    color_random_param = sum(params) / PARAM_RANGE_MAX_SUM
    for i in range(1, node_number + 1):
        data["nodes"].append({
            "id": str(i),
            "color": random_func(i),
            "size": random_func(i)
        })

    for pair in edges:
        data["links"].append({"source": str(pair[0]), "target": str(pair[1])})

    with open(file, 'w') as f:
        f.write(json.dumps(data, indent=2))


def main():
    for params in product(PARAM_A_RANGE, PARAM_B_RANGE, PARAM_C_RANGE):
        node_number = random_node_number(params)
        edges = random_edges(node_number)
        write_data_file(params, node_number, edges, path.join(DATA_DIR, "data-{}-{}-{}.json".format(*params)))
        print("generated {},  \tnodes# {},  \tedges# {}".format(params, node_number, len(edges)))


if __name__ == "__main__" and argv[1] == 'g':
    main()
