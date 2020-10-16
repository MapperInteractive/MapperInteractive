import pandas as pd
import argparse
import os
import app.views as MI  # MapperInteractive
from app import kmapper as km
from app import cover as km_cover
from sklearn.cluster import DBSCAN
import json
import itertools


def mkdir(f):
    if not os.path.exists(p):
        os.mkdir(p)
    assert os.path.isdir(p), 'Not an output directory!'


def extract_range(s):
    s = s.strip().split(':')
    assert len(
        s) == 3, 'Invalid input format to either overlaps or intervals argument'
    try:
        params = [int(x) for x in s]
    except:
        print(
            'ERROR: Unable to parse input format to either overlaps or intervals argument')
        exit()
    for x in params:
        assert x > 0, 'Can not have non-positive values for overlaps or intervals argument'
    choices = [params[0] + params[-1] *
               i for i in range((params[1]-params[0]) // params[-1])]
    choices.append(params[1])
    return choices


def mapper_wrapper(X, overlap, intervals, filter, clusterer, filter_params=None, **mapper_args):
    mapper = km.KeplerMapper()
    if type(filter) is not list:
        filter_fn = MI.compute_lens(filter, data, mapper, filter_params)
    else:
        lens = []
        for f in filter:
            lens_f = compute_lens(f, data, mapper, filter_parameters)
            lens.append(lens_f)
        filter_fn = np.concatenate((lens[0], lens[1]), axis=1)
    graph = mapper.map_parallel(filter_fn, X, clusterer=clusterer, cover=km_cover.Cover(
        n_cubes=intervals, perc_overlap=overlap), **mapper_args)
    return graph


def graph_to_dict(graph):
    pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Mapper Interactive Command Line Tool. \nSee CLI_README.md for details.')
    parser.add_argument('input', type=str,
                        help='Specific input (must be CSV file)')
    parser.add_argument('-i', '--intervals', type=str, required=True,
                        help='Intervals to use in the form START:END:STEP')
    parser.add_argument('-o', '--overlaps', type=str, required=True,
                        help='Overlaps to use in the form START:END:STEP (expects integers)')
    parser.add_argument('-f', '--filter', type=str,
                        help='Which filter function to use. See docs for choices.')
    parser.add_argument('-output', type=str,
                        help='Output Directory. Defaults to "./graph/"')
    parser.add_argument('--no-preprocess', action='store_true')
    parser.add_argument('--dbscan-threads', type=int,
                        default=2, help='Number of threads for DBSCAN')
    parser.add_argument('--distance-threads', type=int, default=4,
                        help='Number of threads to allocate to distance computations')
    parser.add_argument('--eps', type=float,
                        help='Epsilon for DBSCAN', required=True)
    parser.add_argument('--num_pts', type=int,
                        help='num_pts for DBSCAN', required=True)
    parser.add_argument('--gpu-id', default='-1', type=str,
                        help='id(s) for CUDA_VISIBLE_DEVICES')  # TODO there's definitely a better way to parse cuda devices
    args = parser.parse_args()

    fname = args.input
    intervals_str = args.intervals
    overlaps_str = args.overlaps
    filter_str = args.filter
    output_dir = args.output
    no_preprocess = args.no_preprocess
    dbscan_threads = args.dbscan_threads
    distance_threads = args.distance_threads
    gpu_ids = args.gpu_id
    eps = args.eps
    num_pts = args.num_pts

    # Setup
    mkdir(output_dir)
    overlaps = extract_range(overlaps_str)
    intervals = extract_range(intervals_str)
    for overlap, interval in itertools.product(overlaps, intervals)
