"use strict";

/**
 * Component class for Dropdown range.
 */
define(function () {

  const { _, $, b: { View, Model } } = window;

  return View.extend({

    template: _.template('<label class="ui-form-dropdown__label"><%= label %></label>' +
      '<select class="ui-form-dropdown__input form-control" name="<%= name %>"></select>'),

    initialize: function () {
      this.config = new Model({
        label: 'range',
        name: '',
        value: null,
        options: [],
      });
    },

    events: {
      'change .form-control': 'valueChanged',
    },

    render: function () {
      this.$el.addClass('form-group ui-form-range');
      this.$el.html(this.template(this.config.attributes));

      let $select = this.$('.form-control');
      _.map(this.config.get('options'), (op) => {
        let $opEl = $("<option value='" + op + "'>" + op + "</option>");
        if (op === this.config.get('value')) {
          $opEl.attr('selected', true);
        }
        $select.append($opEl);
      });
    },

    valueChanged: function (e) {
      this.config.set('value', e.target.value);
    },
  });

});
