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
      // you should register all vendors here
      'backbone': 'core/vendors/backbone.min',
      'bootstrap': 'core/vendors/bootstrap.bundle.min',
      'd3': 'core/vendors/d3.min',
      'd3-color': 'core/vendors/d3-color.min',
      'd3-interpolate': 'core/vendors/d3-interpolate.min',
      'd3-scale-chromatic': 'core/vendors/d3-scale-chromatic.min',
      'jquery': 'core/vendors/jquery.min',
      'require': 'core/vendors/require.min',
      'underscore': 'core/vendors/underscore.min',
    }
  });

  /**
   * we need to let RequireJS know how to load core modules and project modules correctly.
   */
  const superLoader = require.load;

  require.load = function (context, moduleId, url) {

    if (!(moduleId in context.config.paths)) {
      if (moduleId.startsWith("modules/")) {
        url = context.config.baseUrl + "app/" + moduleId + '.js';
      } else {
        url = context.config.baseUrl + "core/modules/" + moduleId + '.js';
      }
    }

    console.debug('[require] ' + moduleId + ' @ ' + url);
    return superLoader(context, moduleId, url);
  };

  /**
   * Keep this line as the last statement in this function.
   * It will require and execute your project `main.js` module.
   */
  require(['modules/main']);

});
