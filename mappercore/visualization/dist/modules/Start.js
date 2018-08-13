"use strict";

/**
 * This file bootstrap the UI
 */

window.jQuery(function () {

  // noinspection JSFileReferences
  /**
   * Set aliases for modules.
   *
   * You can add your aliases but don't delete anyone before you understand the code below.
   */
  require.config({
    baseUrl: '/',
    paths: {
      'd3-scale-chromatic': 'core/vendors/d3-scale-chromatic.min',
      'd3-interpolate': 'core/vendors/d3-interpolate.min',
      'd3-color': 'core/vendors/d3-color.min'
    }
  });

  /**
   * Since we use two blueprints in Flask,
   *  we need to let RequireJS know how to load core modules and project modules correctly.
   */
  var load = require.load;
  require.load = function (context, moduleId, url) {
    if (!(moduleId in context.config.paths)) {
      var modules = moduleId.split('/');
      if (modules[0] !== 'core') {
        modules.unshift('app');
      }
      url = context.config.baseUrl + modules[0] + '/modules/' + modules.slice(1).join('/') + '.js';
    }
    return load(context, moduleId, url);
  };

  /**
   * Keep this line as the last statement in this function.
   * It will require and execute your project `main.js` module.
   */
  require(['main']);
});