define(function (require) {

  let _ = require('underscore');
  let Backbone = require('backbone');
  let ViewModel = Backbone.Model.extend();

  return Backbone.View.extend({

    template: _.template('<label class="ui-form-range__label"><%= label %></label>' +
      '<span class="ui-form-range__value"><%= value %></span>' +
      '<input class="ui-form-range__input" name="<%= name %>" type="range" value="<%= value %>" max="<%= max %>" min="<%= min %>" step="<%= step %>" />'),

    initialize: function () {
      this.states = new ViewModel({
        label: 'range',
        name: '',
        value: 0,
        max: 100,
        min: 0,
        step: 1
      });
      this.$el.addClass('form-group ui-form-range');
    },

    events: {
      'change input': 'valueChanged',
      'input input': 'valueChanging'
    },

    render: function () {
      this.$el.html(this.template(this.states.attributes));
    },

    valueChanged: function (e) {
      this.states.set('value', e.target.value);
    },

    valueChanging: function (e) {
      this.$('.ui-form-range__value').text(e.target.value);
    }

  });

});
