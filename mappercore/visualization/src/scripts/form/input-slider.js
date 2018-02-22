define(function (require) {

  var _ = require('underscore');
  var Backbone = require('backbone');
  var ViewModel = Backbone.Model.extend();

  return Backbone.View.extend({

    initialize: function () {
      this.model = new ViewModel({
        label: 'range',
        value: 10,
        max: 100,
        min: 0,
        step: 1
      });
    },

    events: {
      'change input': 'valueChanged',
      'input input': 'valueChanging'
    },

    render: function () {
      this.$el.html(this.template(this.model.attributes));
    },

    valueChanged: function (e) {
      this.model.set('value', e.target.value);
    },

    valueChanging: function (e) {
      this.$('.base-form-slider-value').text(e.target.value);
    }

  });

});
