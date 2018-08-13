"use strict";

/**
 * Provides shortcuts for built-in libraries
 *
 * For example:
 *
 *    let { _, Backbone } = require('core/Lib');
 */

define(function (require) {

  var d3 = require('core/vendors/d3.min'),
      underscore = require('core/vendors/underscore.min'),
      $ = require('core/vendors/jquery.min'),
      Backbone = require('core/vendors/backbone.min');

  var _ = underscore.mixin({
    guard: function guard(variable, fallback) {
      if (!variable) {
        if (typeof fallback === 'function') {
          return fallback();
        } else {
          return fallback;
        }
      }
      return variable;
    }
  });

  return { d3: d3, _: _, $: $, Backbone: Backbone };
});