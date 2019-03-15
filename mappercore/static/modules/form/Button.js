"use strict";

/**
 * Component class for HTML button.
 */

define(function () {
  var _window = window,
      _ = _window._,
      $ = _window.$,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model,
      guard = _window.guard;


  return View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function initialize() {
      var _this = this;

      this.config = new Model({
        disable: false,
        text: 'Submit'
      });
      this.button = $(this.template(this.config.attributes));

      this.listenTo(this.config, 'change:disable', function () {
        if (_this.config.get('disable')) {
          _this.button.addClass('disabled');
        } else {
          _this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.config, 'change:text', function () {
        _this.button.text(_this.config.get('text'));
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
      this.$el.addClass('form-group');
      this.button.text(this.config.get('text'));
      this.$el.html(this.button);
    }
  });
});