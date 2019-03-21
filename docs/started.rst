Getting Started
------------------



Setup
=======


Install MapperCore with pip:

::

    pip install mappercore


Then, create a file :code:`run.py` and a file :code:`config.py`.


::

    from mappercore import Server
    server = Server("Mapper Example Demo")
    server.flask.run()


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