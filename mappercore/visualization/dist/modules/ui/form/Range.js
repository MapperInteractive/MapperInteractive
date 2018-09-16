"use strict";

/**
 * Component class for HTML range.
 */

define(function (require) {

  var _ = require('underscore');

  var _require = require('backbone'),
      View = _require.View,
      Model = _require.Model;

  return View.extend({

    template: _.template('<label class="ui-form-range__label"><%= label %></label>' + '<span class="ui-form-range__value"><%= value %></span>' + '<input class="ui-form-range__input" name="<%= name %>" type="range" value="<%= value %>" max="<%= max %>" min="<%= min %>" step="<%= step %>" />'),

    initialize: function initialize() {
      this.model = new Model({
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

    render: function render() {
      this.$el.html(this.template(this.model.attributes));
    },

    valueChanged: function valueChanged(e) {
      this.model.set('value', e.target.value);
    },

    valueChanging: function valueChanging(e) {
      this.$('.ui-form-range__value').text(e.target.value);
    }

  });
});