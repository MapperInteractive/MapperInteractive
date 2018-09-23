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
      'behaviors': ['force-simulation', 'labeled', 'draggable', 'popover'],
      'modes': ['select-node', 'select-cluster', 'select-path',],
      'behavior.popover.content': function (d) {
        return '<ul class="list-group">' +
          '<li class="list-group-item"><strong>ID</strong>: ' + d['id'] + '</li>' +
          '</ul>';
      }
    }
  });

  /**
   * We use a built-in function to convert edge list to a D3 graph data set.
   */
  mapperInstance.createPane(
    require('core/mapper/panes/FormDataLoader'),
    {
      // display three sliders
      controls: [
        { type: 'range', name: 'a', label: 'Param A', min: 10, max: 90, step: 10, value: 10 },
        { type: 'range', name: 'b', label: 'Param B', min: 10, max: 90, step: 5, value: 10 },
        { type: 'range', name: 'c', label: 'Param C', min: 5, max: 50, step: 5, value: 5 }
      ],
      // // loader function accept data from sliders to request data from server
      loader: function (pane, params) {
        let url = pane.app.url('files/data-' + params['a'] + '-' + params['b'] + '-' + params['c'] + '.json');

        // when data loaded successfully, use `data` event to pass the data to the pane
        d3.json(url, (error, data) => {
          if (error) {
            pane.trigger('error', error)
          } else {
            pane.trigger('data', data)
          }
        });
      }
    }
  );

  mapperInstance.createPane(
    require('core/mapper/panes/ColorFunctions'),
    {
      'valueFunctions': [
        {
          valueName: 'By ID',
          valueFunc: function (d) {
            return parseFloat(d['id'])
          }
        },
        {
          valueName: 'Custom Color Attribute',
          valueFunc: function (d) {
            return d['color']
          }
        },
      ],
    });

  mapperInstance.createPane(
    require('core/mapper/panes/SizeFunctions'),
    {
      'functions': [
        {
          name: 'Reset',
          func: function () {
            return 1.0;
          }
        },
        {
          name: 'Custom Size Attribute',
          func: function (d) {
            return parseFloat(d['size']);
          }
        }
      ]
    });

  /**
   * Render the web page after you have finished build your mapper.
   * This line must be the last line of this module.
   */
  mapperInstance.render();
});
