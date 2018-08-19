"use strict";

/**
 * Panel for building a form to load graph data.
 */

define(function (require) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Range = require('core/ui/form/Range');
  var Button = require('core/ui/form/Button');
  var Panel = require('../Panel');

  var FORM_CONTROLS = {
    'range': Range
  };

  return Panel.extend({

    name: 'Graph Loader',

    didMount: function didMount() {
      var _this = this;

      this.controls = this.model.get('controls');
      this.loader = this.model.get('loader');

      this.on('data', function (data) {
        _this.graph.updateData(data);
      });

      this.on('error', function (error) {
        console.log(error);
      });
    },
    render: function render() {
      var _this2 = this;

      if (!this.controls || !this.loader) {
        return this.$el.html(this._notConfiguredError());
      }

      var controls = [];

      this.controls.map(function (param) {
        var container = $('<div></div>');
        container.appendTo(_this2.$el);

        var controlClass = FORM_CONTROLS[param['type']];
        delete param['type'];
        var control = new controlClass({ el: container });
        control.states.set(param);
        controls.push(control);
        control.render();
      });

      var container = $('<div></div>');
      container.appendTo(this.$el);
      var button = new Button({ el: container });
      this.button = button;

      button.states.set({ text: 'Load Graph' });

      button.on('click', function () {
        var values = _.object(controls.map(function (control) {
          var _control$states$attri = control.states.attributes,
              name = _control$states$attri.name,
              value = _control$states$attri.value;

          return [name, value];
        }));

        _this2.loader(_this2, values);
      });
      button.render();
    },
    _notConfiguredError: function _notConfiguredError() {
      return '<div class="alert alert-danger">' + 'Panel not configured. Please check configuration: ' + '<code>controls</code> and ' + '<code>loader</code>' + '</div>';
    }
  });
});