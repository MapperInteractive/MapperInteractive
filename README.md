# MapperCore

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4affb78857354e45be96167bb765c963)](https://app.codacy.com/app/yaodong/sci-mapper-core?utm_source=github.com&utm_medium=referral&utm_content=yaodong/sci-mapper-core&utm_campaign=Badge_Grade_Dashboard)

MapperCore is a framework to create analysis and visualization with high-dimensional data.

## Installation

Current we have not published MapperCore to pypi, so a user will need to copy all files into his/her project.

When MapperCore is avaliable as a python project, the installation would be

```py
pip install mappercore
```

## A Quick Demo

### Entry Script

First, create a folder for JavaScript files. The name of this folder should be `scripts`. Then create a entry file named `main.js`.

Most of JavaScript files in mappercore provide `require.js` module. So your entry file shoule looks like:

```js
define(function (require) {
  let App = require('core/app');
  let d3 = require('d3');
  let GraphKitLayout = require('core/graphkit/layout');
    
  let app = new App({
    title: 'My Mapper',
    layout: GraphKitLayout
  });
    
  // 1, before customize graph, grab a shortcut to graph
  let graph = app.layout.graph;
    
  // define graph loader to load any type of data from any server
  graph.loader = function() { /* loader logic here */ }
  
  // custom your mapper before rendering
 
  app.render();
```

### Backend Server

Then, create a python file `server.py` in your project root directory. The contents of it is following:

```python
from mappercore import Server

server = Server()

if __name__ == '__main__':
    server.run()
```

### Publish New Version

The following steps need to be performed if you want to publish a new version to PyPI.

1. Make sure your local version is functional and bug free
2. Open setup.py and change the version, e.g., version='1.0.1'
3. If you added new, non-Python files to the project that need to be distributed as well, e.g., configuration files and DB init scripts, add them to MANIFEST.in Note: They need to be within the newsplease subfolder, otherwise the packaged code will not work.
3. Open a terminal and go into the parent of the project's root dir
python setup.py sdist
4. Check the resulting files, especially the egg file: are all the files contained?
5. If everything is ok, upload the new version to PyPI: python setup.py sdist upload

## Contribute

Base on MapperCore, you can create your visualization of graph data, time series data, table data, etc. Everyone is encouraged to share their customized `Layout` .
