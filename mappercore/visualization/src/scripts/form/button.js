define(function (require) {

  var Backbone = require('backbone');

  return Backbone.View.extend({
    events: {
      'click': 'onClick'
    },

    onClick: function () {
      this.trigger('clicked');
    }
  });

});
