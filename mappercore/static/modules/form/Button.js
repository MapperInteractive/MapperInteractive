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

      this.model = new Model({
        disable: false,
        text: 'Submit'
      });
      this.$el.addClass('form-group');
      this.button = $(this.template(this.model.attributes));

      this.listenTo(this.model, 'change:disable', function () {
        if (_this.model.get('disable')) {
          _this.button.addClass('disabled');
        } else {
          _this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.model, 'change:text', function () {
        _this.button.text(_this.model.get('text'));
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
      this.button.text(this.model.get('text'));
      this.$el.html(this.button);
    }
  });
});