"use strict";

/**
 * Component class for HTML button.
 */
define(function () {

  const { _, $, b: { View, Model }, guard } = window;

  return View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function () {
      this.config = new Model({
        disable: false,
        text: 'Submit',
      });
      this.$el.addClass('form-group');
      this.button = $(this.template(this.config.attributes));

      this.listenTo(this.config, 'change:disable', () => {
        if (this.config.get('disable')) {
          this.button.addClass('disabled');
        } else {
          this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.config, 'change:text', () => {
        this.button.text(this.config.get('text'));
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
      this.button.text(this.config.get('text'));
      this.$el.html(this.button);
    }
  });

});
