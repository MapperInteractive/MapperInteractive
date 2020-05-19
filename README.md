# Mapper Interactive



Mapper Interactive is a web-based framework for interactive analysis and visualization of high-dimensional point cloud data  built upon the Mapper algorithm. It is an open source software released under the MIT License.

The Mapper algorithm is a tool from topological data analysis first introduced by Gurjeet Singh, Facundo Mémoli and Gunnar Carlsson in 2007 (http://dx.doi.org/10.2312/SPBG/SPBG07/091-100). 


## Installation

```bash
git clone git@github.com:MapperInteractive/MapperInteractive.git
cd MapperInteractive
python3 run.py
```

You can view the page at http://0.0.0.0:8080/ (If possible, please use Chrome).

## Dependencies
This software requires [Kepler Mapper](https://kepler-mapper.scikit-tda.org/), [scikit-learn](https://scikit-learn.org/stable/), [NetworkX](https://networkx.github.io/) and [flask](https://flask.palletsprojects.com/en/1.1.x/) to run.

If you do not have these packages installed, please use the following command to intall them.

```bash
pip install scikit-learn
pip install kmapper
pip install networkx
pip install flask
```

To perform linear regression, please also make sure you have [statsmodels](https://www.statsmodels.org/stable/index.html) installed.
```bash
pip install statsmodels
```

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contributing

Pull requests are welcomed. 

## Cite

Mapper Interactive: A Toolbox for the Visual Exploration of High-Dimensional Data.
Youjia Zhou, Yaodong Zhao, Lin Yan, Nathaniel Saul, Bei Wang.
2020.



