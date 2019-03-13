"use strict";

/**
 * Component class for Dropdown range.
 */

define(function () {
  var _window = window,
      _ = _window._,
      $ = _window.$,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model;


  return View.extend({

    template: _.template('<label class="ui-form-dropdown__label"><%= label %></label>' + '<select class="ui-form-dropdown__input form-control" name="<%= name %>"></select>'),

    initialize: function initialize() {
      this.model = new Model({
        label: 'range',
        name: '',
        value: null,
        options: []
      });
      this.$el.addClass('form-group ui-form-range');
    },

    events: {
      'change .form-control': 'valueChanged'
    },

    render: function render() {
      var _this = this;

      this.$el.html(this.template(this.model.attributes));

      var $select = this.$('.form-control');
      _.map(this.model.get('options'), function (op) {
        var $opEl = $("<option value='" + op + "'>" + op + "</option>");
        if (op === _this.model.get('value')) {
          $opEl.attr('selected', true);
        }
        $select.append($opEl);
      });
    },

    valueChanged: function valueChanged(e) {
      this.model.set('value', e.target.value);
    }
  });
});