import pandas as pd
import argparse
import os
import app.views as MI  # MapperInteractive
from app import kmapper as km
from app import cover as km_cover
from sklearn.cluster import DBSCAN
import json
import itertools
import numpy as np
from os.path import join
from tqdm import tqdm
from sklearn.preprocessing import MinMaxScaler, normalize


def mkdir(f):
    if not os.path.exists(f):
        os.mkdir(f)
    assert os.path.isdir(f), 'Not an output directory!'


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


def get_filter_fn(X, filter, filter_params=None):
    mapper = km.KeplerMapper()
    if type(filter) is not list:
        filter_fn = MI.compute_lens(filter, X, mapper, filter_params)
    else:
        lens = []
        for f in filter:
            lens_f = MI.compute_lens(filter, X, mapper, filter_params)
            lens.append(lens_f)
        filter_fn = np.concatenate((lens[0], lens[1]), axis=1)
    return filter_fn


def mapper_wrapper(X, overlap, intervals, filter_fn, clusterer, **mapper_args):
    mapper = km.KeplerMapper()
    graph = mapper.map_parallel(filter_fn, X, clusterer=clusterer, cover=km_cover.Cover(
        n_cubes=intervals, perc_overlap=overlap / 100), **mapper_args)
    return graph


def graph_to_dict(g, **kwargs):
    d = {}
    d['nodes'] = {}
    d['edges'] = {}
    for k in g['nodes']:
        d['nodes'][k] = g['nodes'][k]
    for k in g['links']:
        d['edges'][k] = g['links'][k]
    for k in kwargs.keys():
        d[k] = kwargs[k]
    return d


def wrangle_csv(df):
    print('Skipping wrangling, unimplemented')
    return df


def normalize_data(X, norm_type):
    if norm_type == "none" or norm_type is None:
        X_prime = X
        pass
    elif norm_type == "0-1":  # axis=0, min-max norm for each column
        scaler = MinMaxScaler()
        X_prime = scaler.fit_transform(X)
    else:
        X_prime = normalize(X, norm=norm_type, axis=0,
                            copy=False, return_norm=False)
    return X_prime


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
                        help='Output Directory. Defaults to "./graph/"', default='./graph/')
    parser.add_argument('--no-preprocess', action='store_true')
    parser.add_argument('--threads', type=int, default=4,
                        help='Number of threads to allocate')
    parser.add_argument('--eps', type=float,
                        help='Epsilon for DBSCAN', required=True)
    parser.add_argument('--num_pts', type=int,
                        help='num_pts for DBSCAN', default=5)
    parser.add_argument('--norm', help='Normalization of points', default=None)
    parser.add_argument('--gpu-id', default='-1', type=str,
                        help='id(s) for CUDA_VISIBLE_DEVICES')  # TODO there's definitely a better way to parse cuda devices
    parser.add_argument('--metric', default='euclidean',
                        help='Metric for DBSCAN')
    args = parser.parse_args()

    fname = args.input
    intervals_str = args.intervals
    overlaps_str = args.overlaps
    filter_str = args.filter
    output_dir = args.output
    no_preprocess = args.no_preprocess
    threads = args.threads
    gpu_ids = args.gpu_id
    eps = args.eps
    num_pts = args.num_pts
    metric = args.metric
    norm = args.norm

    # Setup
    mkdir(output_dir)
    df = pd.read_csv(fname)
    if not no_preprocess:
        df = wrangle_csv(df)
    df_np = df.to_numpy()
    df_np = normalize_data(df_np, norm_type=norm)
    overlaps = extract_range(overlaps_str)
    intervals = extract_range(intervals_str)
    filter_fn = get_filter_fn(df, filter_str, filter_params=None)
    clusterer = DBSCAN(eps=eps, min_samples=num_pts)
    with open(join(output_dir, 'metadata.json'), 'w+') as fp:
        meta = {'data': fname, 'intervals': intervals_str,
                'overlaps': overlaps_str, 'filter': filter_str, 'normalization': norm,
                'dbscan_eps': eps, 'dbscan_numpts': num_pts}
        json.dump(meta, fp)
    for overlap, interval in tqdm(itertools.product(overlaps, intervals)):
        g = graph_to_dict(mapper_wrapper(
            df_np, overlap, interval, filter_fn, clusterer, n_threads=threads, metric=metric))
        with open(join(output_dir, str(interval) + '_' + str(overlap) + '.json'), 'w+') as fp:
            json.dump(g, fp)
