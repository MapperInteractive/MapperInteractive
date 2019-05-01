.. _Getting Started Guide:

Getting Started Guide
------------------------

Setup
=======

Running Mapper Interactive with the Kepler Mapper backend is very easy. Simply install Mapper Interactive from pip, load your data, and initialize the server.


Install Mapper Interactive with pip:

::

    >>> pip install mapper_interactive


Setup your data:

:: 

    from sklearn import datasets
    # Load example data
    data, labels = datasets.make_circles(n_samples=5000, noise=0.03, factor=0.3)


and initialize the server:

:: 

    from mapper_interactive import Server
    from mapper_interactive.conf.kepler_mapper import KeplerMapperConfig

    # Create kepler mapper config
    conf = KeplerMapperConfig(data=data)
    server = Server("Mapper Example", conf=conf)


To provide further customization, you can supply a JSON file:

:: 

    conf = KeplerMapperConfig(data=data, config="config.json")

For more information on how to configure the system, see the `Configuration` page.





Basic Customization
=====================

Most customization can be done in the :code:`config.py`.

Graph Plugins
+++++++++++++++

    - draggable, 
    - force-simulation, 
    - labeled, 
    - popover

Graph Tools
+++++++++++++

    - select-node
    - select-cluster
    - select-path


Page Blocks
++++++++++++++

Kepler Mapper customization, Linear Regression, Dimensionality Reduction



Full Customization
====================

It is also relatively easy do define your own blocks, plugins, and tools.

Documentation for that process is forthcoming.
