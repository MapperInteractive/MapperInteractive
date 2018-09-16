"use strict";

/**
 * Component class for Dropdown range.
 */
define(function (require) {

  const _ = require('underscore');
  const { View, Model } = require('backbone');

  return View.extend({

    template: _.template('<label class="ui-form-dropdown__label"><%= label %></label>' +
      '<select class="ui-form-dropdown__input form-control" name="<%= name %>"></select>'),

    initialize: function () {
      this.model = new Model({
        label: 'range',
        name: '',
        value: null,
        options: [],
      });
      this.$el.addClass('form-group ui-form-range');
    },

    events: {
      'change .form-control': 'valueChanged',
    },

    render: function () {
      this.$el.html(this.template(this.model.attributes));

      let $select = this.$('.form-control');
      _.map(this.model.get('options'), (op) => {
        let $opEl = $("<option value='" + op + "'>" + op + "</option>");
        if (op === this.model.get('value')) {
          $opEl.attr('selected', true);
        }
        $select.append($opEl);
      });
    },

    valueChanged: function (e) {
      this.model.set('value', e.target.value);
    },
  });

});
