from .graph import AbstractGraph, EnhancedGraph, Graph
from .node import EnhancedNode, Node, Sign

try:
    from matplotlib import cm
    from matplotlib.colors import rgb2hex
    from pyvis.network import Network

    pyvis_available = True
except ImportError:
    pyvis_available = False


def node2compactrep(node, enhanced):
    interval_idx = node.interval_index
    cluster_idx = node.cluster_index
    s = f"Interval: {interval_idx} Cluster: {cluster_idx}"
    if enhanced:
        sign = node.sign.name.lower()
        s += f" Sign: {sign}"
    return s


def pyvis_visualize(
    g: AbstractGraph,
    title: str,
    fname: str,
    enhanced: bool = False,
    notebook: bool = True,
    cmap: str = "autumn",
    physics: bool = True,
):
    if not pyvis_available:
        raise ModuleNotFoundError(
            "pyvis or matplotlib could not be found. This functionality is unavailable."
        )
    assert len(g.nodes) != 0
    nt = Network(notebook=notebook, height="100%", width="100%", heading=title)
    nt.toggle_physics(physics)
    color_map = cm.get_cmap(cmap)
    if enhanced:
        max_fn_val = max([g.function[n] for n in g.nodes])
        min_fn_val = min([g.function[n] for n in g.nodes])
        fn_range = max_fn_val - min_fn_val

    for node in g.nodes:
        nt.add_node(
            node2compactrep(node, enhanced),
            label=" ",
            title=str(node),
            color=rgb2hex(color_map((g.function[node] - min_fn_val) / fn_range)[:3])
            if enhanced
            else "blue",
        )

    for e in g.edges:
        n1, n2 = node2compactrep(e[0], enhanced), node2compactrep(e[1], enhanced)
        nt.add_edge(n1, n2)
    if notebook:
        nt.prep_notebook()
    nt.show(fname)
    # return nt
