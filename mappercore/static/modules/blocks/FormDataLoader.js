"use strict";

/**
 * Block for building a form to load graph data.
 */

define(function (require) {
  var _window = window,
      _ = _window._,
      $ = _window.$;


  var Block = require('Block');

  // HTML elements
  var Range = require('../form/Range');
  var Button = require('../form/Button');
  var Dropdown = require('../form/Dropdown');

  var FORM_CONTROLS = {
    'range': Range,
    'dropdown': Dropdown
  };

  return Block.extend({

    name: 'Graph Loader',

    didMount: function didMount() {
      var _this = this;

      this.controls = this.config.get('controls');
      this.loader = this.config.get('loader');

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
        control.config.set(param);
        controls.push(control);
        control.render();
      });

      var container = $('<div></div>');
      container.appendTo(this.$el);
      var button = new Button({ el: container });
      this.button = button;

      button.config.set({ text: 'Load Graph' });

      button.on('click', function () {
        var values = _.object(controls.map(function (control) {
          var _control$config$attri = control.config.attributes,
              name = _control$config$attri.name,
              value = _control$config$attri.value;

          return [name, value];
        }));

        _this2.loader(_this2, values);
      });
      button.render();
    },
    _notConfiguredError: function _notConfiguredError() {
      return '<div class="alert alert-danger">' + 'Block not configured. Please check configuration: ' + '<code>controls</code> and ' + '<code>loader</code>' + '</div>';
    }
  });
});