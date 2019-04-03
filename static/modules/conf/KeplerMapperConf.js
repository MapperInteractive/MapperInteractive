"use strict";

define((require) => {

  const default_form = [
    {
      type: 'range',
      config: {
        name: 'interval',
        label: 'Interval',
        value: 5,
        max: 50,
        min: 5,
        step: 5,
      }
    },
    {
      type: 'range',
      config: {
        name: 'overlap',
        label: 'Overlap %',
        value: 50,
        max: 80,
        min: 10,
        step: 5,
      }
    },
    {
      type: 'range',
      config: {
        name: 'dbscan_eps',
        label: 'eps (DBSCAN)',
        value: 0.1,
        max: 0.2,
        min: 0.05,
        step: 0.01,
      }
    },
    {
      type: 'range',
      config: {
        name: 'dbscan_min_samples',
        label: 'min samples (DBSCAN)',
        value: 5,
        max: 10,
        min: 2,
        step: 1,
      }
    },
  ];
  const default_plugins = ['force-simulation', 'draggable', 'labeled'];
  const default_selection = [
    {
      name: 'size of node',
      attr: 'size'
    }
  ];


  const form = user_specs.form ? user_specs.form : default_form;
  const plugins = user_specs.plugins ? user_specs.plugins : default_plugins;
  const selection = user_specs.selection ? user_specs.selection : default_selection;

  let Workspace = require('Workspace');

  /**
   * With class `Mapper`, let create our instance with title "Random Graphs".
   */
  let workspace = new Workspace({
    title: "demo",
    graph: {
      plugins: plugins,
    }
  });

  /**
   * Add a form to load data
   */
  workspace.getSidebar().addBlock(
    require('blocks/FormDataLoader'),
    {
      'form': form,
      'loader': function (form, setData, setError) {
        workspace.call('run_mapper', form)
          .then((data) => {
            setData(data);
          })
          .catch((error) => {
            setError(error);
          });
      }
    }
  );



  /**
   * Add color function in sidebar
   */
  workspace.getSidebar().addBlock(
    require('blocks/ColorFunctions'),
    {
      'selection': selection
    });

  workspace.render();
});
