# Mapper Interactive

Mapper Interactive is a web-based framework for interactive analysis and visualization of high-dimensional point cloud data  built upon the Mapper algorithm. It is an open source software released under the MIT License.

The Mapper algorithm is a tool from topological data analysis first introduced by Gurjeet Singh, Facundo Mémoli and Gunnar Carlsson in 2007 (http://dx.doi.org/10.2312/SPBG/SPBG07/091-100). 

# MIAT: Mapper Interactive Adversarial Training

This branch is an extension of the original Mapper Interactive for exploring the mapper graphs generated from the activation space of adversarial training.

#### Cite

Visualizing and Analyzing the Topology of Neuron Activations in Deep Adversarial Training.
Youjia Zhou, Yi Zhou, Jie Ding, Bei Wang.\
*2nd Annual TAG in Machine Learning Workshop at the 40th International Conference on Machine Learning (ICML)*, 2023.


## Installation

```bash
git clone https://github.com/MapperInteractive/MapperInteractive.git (or git clone git@github.com:MapperInteractive/MapperInteractive.git)
cd MapperInteractive
python3 run.py
```

After running the above commands, you can run Mapper Interactive by visiting http://127.0.0.1:8080/ on the local machine (If possible, please use Chrome).

To switch to the MIAT branch, run
```
git checktout MIAT
```

## Dependencies
This software requires [Kepler Mapper](https://kepler-mapper.scikit-tda.org/), [scikit-learn](https://scikit-learn.org/stable/), [NetworkX](https://networkx.github.io/) and [flask](https://flask.palletsprojects.com/en/1.1.x/) to run.

If you do not have these packages installed, please use the following command to intall them.

```bash
pip install scikit-learn
pip install networkx
pip install flask
pip install flask_assets
```

To perform linear regression, please also make sure you have [statsmodels](https://www.statsmodels.org/stable/index.html) installed.
```bash
pip install statsmodels
```

## Loading a dataset
When loading a dataset into the interface, please make sure to put the data file to be loaded in the folder ``app/static/uploads/``.

## Command-line API
Please refer to a user-guide [here](CLI_README.md) for the command-line API.

## Video

[![Screenshot of video](app/static/assets/video-teaser.png)](https://www.youtube.com/watch?v=KxHHrCXwGEI)

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contributing

Pull requests are welcomed. 

https://arxiv.org/abs/2011.03209.



