# Mapper interactive

Mapper Interactive is a web-based framework for interactive analysis and visualization of high-dimensional point cloud data  built upon the Mapper algorithm. It is an open source software released under the MIT License.

The Mapper algorithm is a tool from topological data analysis first introduced by Gurjeet Singh, Facundo Mémoli and Gunnar Carlsson in 2007 (http://dx.doi.org/10.2312/SPBG/SPBG07/091-100). 


## Installation

```bash
pip install mapper-interactive
python -m  mapper_interactive serve
```

After running the above commands, a web browser should open with MapperInteractive running.

## Optional Dependencies

To perform linear regression please install `mapper-interactive` with optional dependencies.

```sh
pip install mapper_interactive[linear]
```

## Command-line API
Please refer to a user-guide [here](CLI_README.md) for the command-line API.

## Video

[![Screenshot of video](assets/video-teaser.png)](https://www.youtube.com/watch?v=KxHHrCXwGEI)

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contributing

Pull requests are welcomed. 

## Cite

Mapper Interactive: A Scalable, Extendable, and Interactive Toolbox for the Visual Exploration of High-Dimensional Data.
Youjia Zhou, Nithin Chalapathi, Archit Rathore, Yaodong Zhao, Bei Wang.\
*IEEE Pacific Visualization (PacificVis)*, accepted, 2021.

https://arxiv.org/abs/2011.03209.



