/**
 * This is a registry for built-in modes and behaviors.
 * It's more convenient to use names instead of module paths.
 */
define(function (require) {
  return {
    'modes': {
      'select-node': require('./graph/modes/SelectNode'),
      'select-cluster': require('./graph/modes/SelectCluster'),
      'select-path': require('./graph/modes/SelectPath')
    },
    'behaviors': {
      'force-simulation': require('./graph/behaviors/ForceSimulation'),
      'draggable': require('./graph/behaviors/Draggable'),
      'labeled': require('./graph/behaviors/Labeled'),
      'popover': require('./graph/behaviors/Popover'),
    }
  };
});
