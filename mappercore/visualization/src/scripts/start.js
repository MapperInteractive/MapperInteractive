window.jQuery(function () {

  require.config({
    baseUrl: '/',
    paths: {
      app: 'core/scripts/app',
      d3: 'core/vendors/d3.min',
      jquery: 'core/vendors/jquery.min',
      underscore: 'core/vendors/underscore.min',
      backbone: 'core/vendors/backbone.min',
      'd3-scale-chromatic': 'core/vendors/d3-scale-chromatic.min',
      'd3-interpolate': 'core/vendors/d3-interpolate.min',
      'd3-color': 'core/vendors/d3-color.min',
    }
  });

  let load = require.load;
  require.load = function (context, moduleId, url) {
    if (!(moduleId in context.config.paths)) {
      let modules = moduleId.split('/');
      if (modules.length === 1) {
        modules.unshift('app');
      }
      url = context.config.baseUrl + modules[0] + '/scripts/' + modules.slice(1).join('/') + '.js';
    }
    return load(context, moduleId, url);
  };

  require(['main']);
});
