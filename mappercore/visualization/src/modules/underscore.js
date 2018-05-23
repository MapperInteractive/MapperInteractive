define(function (require) {

  let underscore = require('underscore');

  underscore.mixin({
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

  return underscore;
});
