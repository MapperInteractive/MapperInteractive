Kangaroo network, part of the Koblenz Network Collection
===========================================================================

This directory contains the TSV and related files of the moreno_kangaroo network:

This undirected network contains interactions between free-ranging grey kangaroos. A node represents a kangaroo and an edge between two kangaroos shows that there was an interaction between them. The edge values denote the total count of interactions.


More information about the network is provided here: 
http://konect.uni-koblenz.de/networks/moreno_kangaroo

Files: 
    meta.moreno_kangaroo -- Metadata about the network 
    out.moreno_kangaroo -- The adjacency matrix of the network in space separated values format, with one edge per line
      The meaning of the columns in out.moreno_kangaroo are: 
        First column: ID of from node 
        Second column: ID of to node
        Third column: edge weight


Complete documentation about the file format can be found in the KONECT
handbook, in the section File Formats, available at:

http://konect.uni-koblenz.de/publications

All files are licensed under a Creative Commons Attribution-ShareAlike 2.0 Germany License.
For more information concerning license visit http://konect.uni-koblenz.de/license.



Use the following References for citation:

@MISC{konect:2016:moreno_kangaroo,
    title = {Kangaroo network dataset -- {KONECT}},
    month = sep,
    year = {2016},
    url = {http://konect.uni-koblenz.de/networks/moreno_kangaroo}
}

@article{konect:grant,
  title={Dominance and Association among Members of a Captive and a
                  Free-ranging Group of Grey Kangaroos (\emph{{Macropus} giganteus})},
  author={Grant, TR},
  journal={Animal Behaviour},
  volume={21},
  number={3},
  pages={449--456},
  year={1973},
  publisher={Elsevier}
}


@inproceedings{konect,
	title = {{KONECT} -- {The} {Koblenz} {Network} {Collection}},
	author = {Jérôme Kunegis},
	year = {2013},
	booktitle = {Proc. Int. Conf. on World Wide Web Companion},
	pages = {1343--1350},
	url = {http://userpages.uni-koblenz.de/~kunegis/paper/kunegis-koblenz-network-collection.pdf}, 
	url_presentation = {http://userpages.uni-koblenz.de/~kunegis/paper/kunegis-koblenz-network-collection.presentation.pdf},
}


