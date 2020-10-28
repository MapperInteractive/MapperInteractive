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
    '''
    Check for:
    1. Missing value
    2. Non-numerical elements in numerical cols
    3. If cols are non-numerical, check if cols are categorical
    '''
    newdf1 = df.to_numpy()[1:]
    rows2delete = np.array([])
    cols2delete = []

    # ### Delete missing values ###
    for i in range(len(cols)):
        col = newdf1[:, i]
        # if more than 20% elements in this column are empty, delete the whole column
        if np.sum(col == "") >= 0.2*len(newdf1):
            cols2delete.append(i)
        else:
            rows2delete = np.concatenate((rows2delete, np.where(col == "")[0]))
    rows2delete = np.unique(rows2delete).astype("int")
    newdf2 = np.delete(np.delete(newdf1, cols2delete,
                                 axis=1), rows2delete, axis=0)
    cols = [cols[i] for i in range(len(cols)) if i not in cols2delete]

    ### check if numerical cols ###
    cols_numerical_idx = []
    cols_categorical_idx = []
    cols_others_idx = []
    rows2delete = np.array([])
    r1 = re.compile(r'^-?\d+(?:\.\d+)?$')
    # scientific notation
    r2 = re.compile(
        r'[+\-]?[^A-Za-z]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)')
    vmatch = np.vectorize(lambda x: bool(r1.match(x) or r2.match(x)))
    for i in range(len(cols)):
        col = newdf2[:, i]
        col_match = vmatch(col)
        # if more than 90% elements can be converted to float, keep the col, and delete rows that cannot be convert to float:
        if np.sum(col_match) >= 0.8*len(newdf1):
            cols_numerical_idx.append(i)
            rows2delete = np.concatenate(
                (rows2delete, np.where(col_match == False)[0]))
        else:
            ### check if categorical cols###
            if len(np.unique(col)) <= 200:  # if less than 10 different values: categorical
                cols_categorical_idx.append(i)
            else:
                cols_others_idx.append(i)
    newdf3 = newdf2[:, cols_numerical_idx+cols_categorical_idx+cols_others_idx]
    rows2delete = rows2delete.astype(int)
    newdf3 = np.delete(newdf3, rows2delete, axis=0)
    newdf3_cols = [cols[idx] for idx in cols_numerical_idx +
                   cols_categorical_idx+cols_others_idx]
    newdf3 = pd.DataFrame(newdf3)
    newdf3.columns = newdf3_cols
    # write the data frame
    newdf3.to_csv(APP_STATIC+"/uploads/processed_data.csv", index=False)
    return newdf3


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
    parser.add_argument('--gpu', action='store_true',
                        help='id(s) for CUDA_VISIBLE_DEVICES')
    parser.add_argument('--metric', default='euclidean',
                        help='Metric for DBSCAN')
    parser.add_argument('--preprocess_only', action='store_true')
    args = parser.parse_args()

    fname = args.input
    intervals_str = args.intervals
    overlaps_str = args.overlaps
    filter_str = args.filter
    output_dir = args.output
    no_preprocess = args.no_preprocess
    threads = args.threads
    gpu = args.gpu
    eps = args.eps
    num_pts = args.num_pts
    metric = args.metric
    norm = args.norm
    preprocess_only = args.preprocess_only

    # Setup
    mkdir(output_dir)
    df = pd.read_csv(fname)
    if not no_preprocess or preprocess_only:
        df = wrangle_csv(df)
        df.to_csv(join(output_dir, 'wrangled_data.csv'))
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
            df_np, overlap, interval, filter_fn, clusterer, n_threads=threads, metric=metric, use_gpu=gpu))
        with open(join(output_dir, 'mapper_' + str(fname) + '_' + str(interval) + '_' + str(overlap) + '.json'), 'w+') as fp:
            json.dump(g, fp)
