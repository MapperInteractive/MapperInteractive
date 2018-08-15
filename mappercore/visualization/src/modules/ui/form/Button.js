"use strict";

/**
 * Component class for HTML button.
 */
define(function (require) {

  const _ = require('underscore');
  const $ = require('jquery');
  const { View, Model } = require('backbone');

  return View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function () {
      this.states = new Model({
        disable: false,
        text: 'Submit',
      });
      this.$el.addClass('form-group');
      this.button = $(this.template(this.states.attributes));

      this.listenTo(this.states, 'change:disable', () => {
        if (this.states.get('disable')) {
          this.button.addClass('disabled');
        } else {
          this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.states, 'change:text', () => {
        this.button.text(this.states.get('text'));
      });
    },

    events: {
      'click': 'onClick'
    },

    onClick: function (e) {
      e.preventDefault();
      this.trigger('click');
    },

    render: function () {
      this.button.text(this.states.get('text'));
      this.$el.html(this.button);
    }
  });

});
