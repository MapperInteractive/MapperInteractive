import itertools
import json
import os
import re
from os.path import join

import app.views as MI  # MapperInteractive
import numpy as np
import pandas as pd
from app import cover as km_cover
from app import kmapper as km
from app.enhanced_mapper.AdaptiveCover import mapper_xmeans_centroid
from app.enhanced_mapper.cover import Cover as enhanced_Cover
from app.enhanced_mapper.mapper import generate_mapper_graph
from sklearn.cluster import DBSCAN, AgglomerativeClustering, MeanShift
from sklearn.preprocessing import MinMaxScaler, normalize


def mkdir(f):
    if not os.path.exists(f):
        os.mkdir(f)
    assert os.path.isdir(f), "Not an output directory!"


def extract_range(s):
    s = s.strip().split(":")
    assert (
        len(s) == 3 or len(s) == 1
    ), "Invalid input format to either overlaps or intervals argument"
    try:
        params = [int(x) for x in s]
    except:
        print(
            "ERROR: Unable to parse input format to either overlaps or intervals argument"
        )
        exit()
    for x in params:
        assert (
            x > 0
        ), "Can not have non-positive values for overlaps or intervals argument"
    if len(s) == 1:
        choices = [int(s[0])]
    elif len(s) == 3:
        choices = [
            params[0] + params[-1] * i
            for i in range((params[1] - params[0]) // params[-1])
        ]
        choices.append(params[1])
    return choices


def get_filter_fn(X, filter, filter_params=None):
    mapper = km.KeplerMapper()
    if type(filter) is not list:
        if filter in X.columns:
            filter_fn = np.array(X[filter]).reshape(-1, 1)
        else:
            filter_fn = MI.compute_lens(filter, X, mapper, filter_params)
    else:
        lens = []
        for f in filter:
            if f in X.columns:
                lens_f = np.array(X[f]).reshape(-1, 1)
            else:
                lens_f = MI.compute_lens(f, X, mapper, filter_params)
            lens.append(lens_f)
        filter_fn = np.concatenate((lens[0], lens[1]), axis=1)
    return filter_fn


def mapper_wrapper(X, filter_fn, clusterer, cover, is_parallel=True, **mapper_args):
    mapper = km.KeplerMapper()
    if is_parallel:
        graph = mapper.map_parallel(
            filter_fn, X, clusterer=clusterer, cover=cover, **mapper_args
        )
    else:
        graph = mapper.map(
            filter_fn, X, clusterer=clusterer, cover=cover, **mapper_args
        )
    return graph


def graph_to_dict(g, **kwargs):
    d = {}
    d["nodes"] = {}
    d["edges"] = {}
    for k in g["nodes"]:
        d["nodes"][k] = g["nodes"][k]
    for k in g["links"]:
        d["edges"][k] = g["links"][k]
    for k in kwargs.keys():
        d[k] = kwargs[k]
    return d


def get_node_id(node):
    interval_idx = node.interval_index
    cluster_idx = node.cluster_index
    node_id = "node" + str(interval_idx) + str(cluster_idx)
    return node_id


def graph_to_dict_enhanced(g, **kwargs):
    d = {}
    d["nodes"] = {}
    d["edges"] = {}
    print(g)
    for node in g.nodes:
        node_id = get_node_id(node)
        d["nodes"][node_id] = [int(m) for m in list(node.members)]
    for k in g.edges:
        node1_id, node2_id = get_node_id(k[0]), get_node_id(k[1])
        if node1_id not in d["edges"]:
            d["edges"][node1_id] = []
        d["edges"][node1_id].append(node2_id)
    for k in kwargs.keys():
        d[k] = kwargs[k]
    return d


def wrangle_csv(df):
    """
    Check for:
    1. Missing value
    2. Non-numerical elements in numerical cols
    3. If cols are non-numerical, check if cols are categorical
    """
    newdf1 = df.to_numpy().astype("str")
    cols = df.columns
    rows2delete = np.array([])
    cols2delete = []

    # ### Delete missing values ###
    for i in range(len(cols)):
        col = newdf1[:, i]

        # if more than 20% elements in this column are empty, delete the whole column
        if np.sum(col == "") >= 0.2 * len(newdf1):
            cols2delete.append(i)
        else:
            rows2delete = np.concatenate((rows2delete, np.where(col == "")[0]))
    rows2delete = np.unique(rows2delete).astype("int")
    newdf2 = np.delete(np.delete(newdf1, cols2delete, axis=1), rows2delete, axis=0)
    cols = [cols[i] for i in range(len(cols)) if i not in cols2delete]

    ### check if numerical cols ###
    cols_numerical_idx = []
    cols_categorical_idx = []
    cols_others_idx = []
    rows2delete = np.array([])
    r1 = re.compile(r"^-?\d+(?:\.\d+)?$")
    # scientific notation
    r2 = re.compile(r"[+\-]?[^A-Za-z]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)")
    vmatch = np.vectorize(lambda x: bool(r1.match(x) or r2.match(x)))
    for i in range(len(cols)):
        col = newdf2[:, i]
        col_match = vmatch(col)
        # if more than 90% elements can be converted to float, keep the col, and delete rows that cannot be convert to float:
        if np.sum(col_match) >= 0.8 * len(newdf1):
            cols_numerical_idx.append(i)
            rows2delete = np.concatenate((rows2delete, np.where(col_match == False)[0]))
        else:
            ### check if categorical cols###
            if (
                len(np.unique(col)) <= 200
            ):  # if less than 10 different values: categorical
                cols_categorical_idx.append(i)
            else:
                cols_others_idx.append(i)
    newdf3 = newdf2[:, cols_numerical_idx + cols_categorical_idx + cols_others_idx]
    rows2delete = rows2delete.astype(int)
    newdf3 = np.delete(newdf3, rows2delete, axis=0)
    newdf3_cols = [
        cols[idx] for idx in cols_numerical_idx + cols_categorical_idx + cols_others_idx
    ]
    newdf3 = pd.DataFrame(newdf3)
    newdf3.columns = newdf3_cols
    return newdf3, cols_numerical_idx, cols_categorical_idx


def normalize_data(X, norm_type):
    if norm_type == "none" or norm_type is None:
        X_prime = X
        pass
    elif norm_type == "0-1":  # axis=0, min-max norm for each column
        scaler = MinMaxScaler()
        X_prime = scaler.fit_transform(X)
    else:
        X_prime = normalize(X, norm=norm_type, axis=0, copy=False, return_norm=False)
    return X_prime


def get_mapper_graph(
    df,
    clusterer,
    filter_str="l2norm",
    interval=5,
    overlap=50,
    normalization=None,
    output_dir="./",
    output_fname="output",
    selected_cols=[],
    categorical_cols=[],
    is_parallel=True,
    is_enhanced_cover=False,
    enhanced_parameters=None,
    **mapper_args
):
    """
    df: pd.DataFrame
    """
    if len(selected_cols) == 0:
        df_np = df.to_numpy()
    else:
        df_np = df[selected_cols].to_numpy()
    try:
        df_np = df_np.astype("float")
    except:
        print("ERROR: Unable to convert input data to float!")
        exit()

    if normalization:
        df_np = normalize_data(df_np, norm_type=normalization)
    filter_fn = get_filter_fn(df[selected_cols].astype("float"), filter_str)

    max_intervals = 100
    if enhanced_parameters != None:
        iterations = enhanced_parameters["iterations"]
        delta = enhanced_parameters["delta"]
        method = enhanced_parameters["method"]  # ["BFS", "DFS", "randomized"]
        BIC = enhanced_parameters["bic"]  # ["BIC, "AIC"]
    else:
        iterations = 100
        delta = 0.1
        method = "BFS"
        BIC = "BIC"

    if is_enhanced_cover:
        cover = enhanced_Cover(interval, overlap / 100)
        multipass_cover = mapper_xmeans_centroid(
            df_np,
            filter_fn,
            cover,
            clusterer,
            iterations,
            max_intervals,
            BIC=BIC,
            delta=delta,
            method=method,
        )
        g_multipass = generate_mapper_graph(
            df_np, filter_fn, multipass_cover, clusterer, refit_cover=False
        )
        g = graph_to_dict_enhanced(g_multipass)

    else:
        cover = km_cover.Cover(n_cubes=interval, perc_overlap=overlap / 100)
        g = graph_to_dict(
            mapper_wrapper(
                df_np,
                filter_fn,
                clusterer,
                cover,
                is_parallel=is_parallel,
                **mapper_args
            )
        )
    for node_id in g["nodes"]:
        vertices = g["nodes"][node_id]
        node = {}
        node["categorical_cols_summary"] = {}
        node["vertices"] = vertices
        node["avgs"] = {}
        node["avgs"]["lens"] = np.mean(filter_fn[vertices])
        for col in categorical_cols:
            data_categorical_i = df[col].iloc[vertices]
            node["categorical_cols_summary"][
                col
            ] = data_categorical_i.value_counts().to_dict()
        g["nodes"][node_id] = node
    g["categorical_cols"] = list(categorical_cols)
    numerical_col_keys = ["lens"]
    g["numerical_col_keys"] = list(numerical_col_keys)

    if is_enhanced_cover:
        filename = (
            "mapper_"
            + str(output_fname)
            + "_"
            + str(interval)
            + "_"
            + str(overlap)
            + "_enhanced.json"
        )
    else:
        filename = (
            "mapper_"
            + str(output_fname)
            + "_"
            + str(interval)
            + "_"
            + str(overlap)
            + ".json"
        )

    with open(join(output_dir, filename), "w") as fp:
        json.dump(g, fp)


def add_arguments(parser):
    parser.add_argument("input", type=str, help="Specific input (must be CSV file)")
    parser.add_argument(
        "-i",
        "--intervals",
        type=str,
        required=True,
        help="Intervals to use in the form INTERVAL_NUM or START:END:STEP",
    )
    parser.add_argument(
        "-o",
        "--overlaps",
        type=str,
        required=True,
        help="Overlaps to use in the form OVERLAP_VAL or START:END:STEP (expects integers)",
    )
    parser.add_argument(
        "-f",
        "--filter",
        type=str,
        required=True,
        help="Which filter function to use. See docs for choices.",
    )
    parser.add_argument(
        "-output",
        type=str,
        help='Output Directory. Defaults to "./graph/"',
        default="./graph/",
    )
    parser.add_argument("--no-preprocess", action="store_true")
    parser.add_argument(
        "--threads", type=int, default=4, help="Number of threads to allocate"
    )

    parser.add_argument(
        "--clusterer",
        type=str,
        required=False,
        choices=["dbscan", "agglomerative", "meanshift", None],
        default="dbscan",
    )

    # DBSCAN args
    parser.add_argument(
        "--eps", type=float, help="DBSCAN Epsilon", required=False, default=0.1
    )
    parser.add_argument(
        "--min_samples", type=int, help="DBSCAN Min points", required=False, default=5
    )

    # Agglomerative args
    parser.add_argument(
        "--linkage",
        help="Type of agglomerative clustering",
        choices=[-1, "ward", "complete", "average", "single"],
        default=-1,
        required=False,
    )
    parser.add_argument(
        "--distance_threshold",
        help="Distance threshold for agglomerative clustering",
        type=float,
        default=-1,
        required=False,
    )

    # Mean Shift args
    parser.add_argument(
        "--bandwidth",
        type=str,
        help='bandwidth for mean shift. If "None" is supplied, scikit-learn estimator is used',
        default="NA",
        required=False,
    )

    parser.add_argument("--norm", help="Normalization of points", default=None)
    parser.add_argument(
        "--gpu", action="store_true", help="id(s) for CUDA_VISIBLE_DEVICES"
    )
    parser.add_argument("--metric", default="euclidean", help="Metric for DBSCAN")
    parser.add_argument("--preprocess_only", action="store_true")

    # Enhanced Mapper args
    parser.add_argument(
        "--enhanced_cover",
        type=bool,
        help="If true, optimization will be applied to compute the enhanced cover",
        default=False,
        required=False,
    )
    parser.add_argument(
        "--iterations",
        type=int,
        help="Number of iterations",
        default=100,
        required=False,
    )
    parser.add_argument(
        "--delta",
        type=float,
        help="The convergence threshold",
        default=0.1,
        required=False,
    )
    parser.add_argument(
        "--method",
        type=str,
        help="BFS, DFS or randomized",
        default="BFS",
        required=False,
    )
    parser.add_argument(
        "--bic", type=str, help="BIC or AIC", default="BIC", required=False
    )


def run(args):
    fname = args.input
    intervals_str = args.intervals
    overlaps_str = args.overlaps
    filter_str = args.filter
    output_dir = args.output
    no_preprocess = args.no_preprocess
    threads = args.threads
    gpu = args.gpu
    clustering_method = args.clusterer
    metric = args.metric
    norm = args.norm
    preprocess_only = args.preprocess_only
    is_enhanced_cover = args.enhanced_cover
    enhanced_parameters = {
        "iterations": args.iterations,
        "delta": args.delta,
        "method": args.method,
        "bic": args.bic,
    }
    print(enhanced_parameters)

    # Setup
    mkdir(output_dir)
    df = pd.read_csv(fname)
    cols = df.columns
    cols_numerical = []
    cols_categorical = []
    if preprocess_only:
        df, cols_numerical_idx, cols_categorical_idx = wrangle_csv(df)
        df.to_csv(join(output_dir, "wrangled_data.csv"))
        exit()
    elif not no_preprocess:
        df, cols_numerical_idx, cols_categorical_idx = wrangle_csv(df)
    if cols_numerical_idx:
        cols_numerical = cols[cols_numerical_idx]
    if cols_categorical_idx:
        cols_categorical = cols[cols_categorical_idx]

    # Regardless, we want to save the data for bookkeeping
    df.to_csv(join(output_dir, "wrangled_data.csv"), index=False)
    overlaps = extract_range(overlaps_str)
    intervals = extract_range(intervals_str)

    meta = {
        "data": fname,
        "intervals": intervals_str,
        "overlaps": overlaps_str,
        "filter": filter_str,
        "normalization": norm,
    }

    assert (
        clustering_method is not None
    ), "Cant run mapper without specifying a clustering method!"
    meta["Clustering_method"] = clustering_method
    if clustering_method == "dbscan":
        assert args.eps != -1, "Must specify eps for DBSCAN"
        assert args.min_samples != -1, "Must specify min_samples for DBSCAN"
        meta["DBSCAN_eps"] = args.eps
        meta["DBSCAN_min_samples"] = args.min_samples
        clusterer = DBSCAN(eps=args.eps, min_samples=args.min_samples)
    elif clustering_method == "agglomerative":
        assert (
            args.linkage is not None
        ), "Linkage must be provided for Agglomerative Clustering"
        assert (
            args.distance_threshold != -1
        ), "Distance threshold must be specified for Agglomerative Clustering"
        meta["Agglomerative_linkage"] = args.linkage
        meta["Agglomerative_distance_threshold"] = args.distance_threshold
        clusterer = AgglomerativeClustering(
            linkage=args.linkage, distance_threshold=args.distance_threshold
        )
    elif clustering_method == "meanshift":
        assert (
            args.bandwidth != "NA"
        ), "Must specify bandwidth for Mean Shift (Did you mean to use None?)"
        if args.bandwidth == "none" or args.bandwidth == "None":
            bandwidth = None
        else:
            try:
                bandwidth = float(args.bandwidth)
            except:
                assert False, "No float value passed to bandwidth for Mean Shift"
        meta["MeanShift_bandwidth"] = "None" if bandwidth is None else bandwidth
        clusterer = MeanShift(bandwidth=args.bandwidth)

    with open(join(output_dir, "metadata.json"), "w+") as fp:
        json.dump(meta, fp)

    output_fname = fname.split("/")[-1]

    # Import here so as to not cause issues when calling serve
    from tqdm import tqdm

    for overlap, interval in tqdm(itertools.product(overlaps, intervals)):
        get_mapper_graph(
            df,
            clusterer,
            filter_str=filter_str,
            interval=interval,
            overlap=overlap,
            normalization=norm,
            output_dir=output_dir,
            output_fname=output_fname,
            selected_cols=cols_numerical,
            categorical_cols=cols_categorical,
            is_parallel=True,
            is_enhanced_cover=is_enhanced_cover,
            enhanced_parameters=enhanced_parameters,
            n_threads=threads,
            metric=metric,
            use_gpu=gpu,
        )
