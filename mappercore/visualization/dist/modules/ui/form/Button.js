"use strict";

/**
 * Component class for HTML button.
 */

define(function (require) {
  var _require = require('core/Lib'),
      _require$Backbone = _require.Backbone,
      View = _require$Backbone.View,
      Model = _require$Backbone.Model;

  return View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function initialize() {
      var _this = this;

      this.states = new Model({
        disable: false,
        text: 'Submit'
      });
      this.$el.addClass('form-group');
      this.button = $(this.template(this.states.attributes));

      this.listenTo(this.states, 'change:disable', function () {
        if (_this.states.get('disable')) {
          _this.button.addClass('disabled');
        } else {
          _this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.states, 'change:text', function () {
        _this.button.text(_this.states.get('text'));
      });
    },

    events: {
      'click': 'onClick'
    },

    onClick: function onClick(e) {
      e.preventDefault();
      this.trigger('click');
    },

    render: function render() {
      this.button.text(this.states.get('text'));
      this.$el.html(this.button);
    }
  });
});