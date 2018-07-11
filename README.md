# Mapper Core

Mapper core is a framework to create resuable visualization projects.

## Installation

Current we haven't publish mappercore to pypi, so you need to copy all files into your project.

When mappercore is avaliable as a python project, the installation would be

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

## Contribute

Base on mappercore, you can create your visualization of graph data, time series data, table data, etc. Everyone is encouraged to share their customized `Layout` .