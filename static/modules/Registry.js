/**
 * This is a registry for built-in modes and plugins.
 * It's more convenient to use names instead of module paths.
 */
define((require) => {
  return {
    'modes': {
      'select-node': require('./graph/modes/SelectNode'),
      'select-cluster': require('./graph/modes/SelectCluster'),
      'select-path': require('./graph/modes/SelectPath')
    },
    'plugins': {
      'force-simulation': require('./graph/plugins/ForceSimulation'),
      'draggable': require('./graph/plugins/Draggable'),
      'labeled': require('./graph/plugins/Labeled'),
      'popover': require('./graph/plugins/Popover'),
    }
  };
});
