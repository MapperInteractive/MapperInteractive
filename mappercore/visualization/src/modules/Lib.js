"use strict";

/**
 * Provides shortcuts for built-in libraries
 *
 * For example:
 *
 *    let { _, Backbone } = require('core/Lib');
 */
define((require) => {

  const d3 = require('d3'),
    underscore = require('underscore'),
    $ = require('jquery'),
    Backbone = require('backbone');

  const _ = underscore.mixin({
    guard: function (variable, fallback) {
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

  return { d3, _, $, Backbone };
});
