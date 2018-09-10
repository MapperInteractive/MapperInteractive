/**
 * Each file in the current folder is a RequireJS module.
 * Please checkout the following URL to learn how to define a RequireJS module.
 * > https://requirejs.org/docs/api.html#define
 *
 * The file `main.js` is the entry file of your project.
 * You create a mapper instance and add your panels here.
 */
define(function (require) {
  /**
   * MapperCore includes some useful libraries, you can get their references by module `lib`.
   *
   */
  const _ = require('underscore');
  const d3 = require('d3');

  /**
   * All MapperCore modules are defined under namespace `core`.
   * So to create a mapper instance, we need to import the class first.
   */
  let Mapper = require('core/Mapper');

  /**
   * With class `Mapper`, let create our instance with title "Random Graphs".
   */
  let mapperInstance = new Mapper({
    title: "Random Graphs",
    options: {
      // default options
      'behaviors': ['force-simulation', 'draggable'],
    }
  });

  /**
   * We use a built-in function to convert edge list to a D3 graph data set.
   */
  let EdgeList2Graph = require('core/utils/EdgelistToGraph');

  mapperInstance.createPane(
    require('core/mapper/panes/FixedDataLoader'),
    {
      loader: function (panel) {
        let url = mapperInstance.url('files/edgelist.txt');
        d3.text(url, function (txt) {
          panel.trigger('data', EdgeList2Graph(txt));
        })
      }
    }
  );

  /**
   * Render the web page after you have finished build your mapper.
   * This line must be the last line of this module.
   */
  mapperInstance.render();
});
