/**
 * Helper functions
 */
define(function () {
  return {
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
  };
});
