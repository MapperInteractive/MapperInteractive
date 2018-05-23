define(function (require) {
  return {
    'modes': {
      'select-node': require('./graph/modes/select-node'),
      'select-cluster': require('./graph/modes/select-cluster'),
      'select-path': require('./graph/modes/select-path')
    },
    'behaviors': {
      'force-simulation': require('./graph/behaviors/force-simulation'),
      'draggable': require('./graph/behaviors/draggable'),
      'labeled': require('./graph/behaviors/labeled'),
      'popover': require('./graph/behaviors/popover'),
    }
  };
});
