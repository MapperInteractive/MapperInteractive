'use strict';

/**
 * This is a registry for built-in tools and plugins.
 * It's more convenient to use names instead of module paths.
 */
define(function (require) {
  return {
    'tools': {
      'select-node': require('./graph/tools/SelectNode'),
      'select-cluster': require('./graph/tools/SelectCluster'),
      'select-path': require('./graph/tools/SelectPath')
    },
    'plugins': {
      'force-simulation': require('./graph/plugins/ForceSimulation'),
      'draggable': require('./graph/plugins/Draggable'),
      'labeled': require('./graph/plugins/Labeled'),
      'popover': require('./graph/plugins/Popover')
    },
    'blocks': {
      'color-function': require('./blocks/ColorFunctions'),
      'fixed-data-loader': require('./blocks/FixedDataLoader'),
      'form-data-loader': require('./blocks/FormDataLoader'),
      'linear-regression': require('./blocks/LinearRegression'),
      'size-function': require('./blocks/FormDataLoader')
    }
  };
});