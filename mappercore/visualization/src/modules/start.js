window.jQuery(function () {

  require.config({
    baseUrl: '/',
    paths: {
      // these libraries are for accessing point
      app: 'core/modules/app',
      lib: 'core/modules/lib',

      // these libraries are required by core only,
      // use require('core') to access these library,
      // because we may need to customize them
      d3: 'core/vendors/d3.min',
      jquery: 'core/vendors/jquery.min',
      underscore: 'core/vendors/underscore.min',
      underscore_remix: 'core/modules/underscore',
      backbone: 'core/vendors/backbone.min',

      // these libraries are built-in vendors
      // require them by the name when needed
      'd3-scale-chromatic': 'core/vendors/d3-scale-chromatic.min',
      'd3-interpolate': 'core/vendors/d3-interpolate.min',
      'd3-color': 'core/vendors/d3-color.min',
    }
  });

  // Since we use two blueprints in Flask
  // We need to route the js modules
  let load = require.load;
  require.load = function (context, moduleId, url) {
    if (!(moduleId in context.config.paths)) {
      let modules = moduleId.split('/');
      if (modules[0] !== 'core') {
        modules.unshift('app');
      }
      url = context.config.baseUrl + modules[0] + '/modules/' + modules.slice(1).join('/') + '.js';
    }
    return load(context, moduleId, url);
  };

  require(['main']);
});
