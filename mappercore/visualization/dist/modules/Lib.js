"use strict";

/**
 * Provides helper functions
 */

define(function (require) {

  var d3 = require('d3'),
      underscore = require('underscore'),
      $ = require('jquery'),
      Backbone = require('backbone');

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