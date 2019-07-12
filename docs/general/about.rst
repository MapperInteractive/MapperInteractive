About
-------

Mapper Interactive is a lightweight server to help rapidly explore the Mapper construction, a topological descriptor, and its associated parameters. It provides a library of easily-extendable modules for developing interactive visualization of high-dimensional data using the Mapper construction. It provides integration with Kepler Mapper (https://kepler-mapper.scikit-tda.org/) and in the near future, with HYPPO-X (https://xperthut.github.io/HYPPO-X/). 

Mapper Interactive is developed by the Topological Data Analysis and Visualization Lab (PI: Bei Wang) at the SCI Institute, University of Utah, with Yaodong Zhao as the lead developer. 

The project is partially supported by NSF grants DBI-1661375, DBI-1661348, and IIS-1513616. 

Citations
-------
Mapper Interactive: A Toolbox for Visual Exploration of High-Dimensional Data.
Yaodong Zhao, Lin Yan, Nathaniel Saul, Youjia Zhou, Bei Wang. 
In preparation, 2019. 

Softwares and Frameworks Used in Mapper Interactive
===================================================

Mapper Interactive uses the following software/frameworks:

- Flask, for web server
- Redis, for data cache
- BackboneJS, for building UI, managing UI states, and managing events
- RequireJS, for dynamic loading JavaScript modules

Why not React, Angular, or EmberJS
=========================================

Mapper Interactive is designed for people with some academic backgrounds, not necessarily web developers. We avoid introducing too much complexity. Researchers who have basic JavaScript knowledge could understand and use our chosen frameworks.
