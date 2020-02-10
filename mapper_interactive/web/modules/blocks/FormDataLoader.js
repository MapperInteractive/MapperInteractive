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
      this._controls = this.config.get('form').map(this._initControl.bind(this));
      this._loader = this.config.get('loader');
    },
    render: function render() {
      if (!this._controls || !this._loader) {
        return this.$el.html(this._displayNotConfiguredError());
      }

      this._renderControls();
      this._renderButton();
    },
    _initControl: function _initControl(control) {
      var controlClass = FORM_CONTROLS[control['type']];

      var view = new controlClass();
      view.config.set(control['config']);
      return view;
    },
    _renderControls: function _renderControls() {
      var _this = this;

      this._controls.map(function (c) {
        return _this.append(c, 'div');
      });
    },
    _renderButton: function _renderButton() {
      var _this2 = this;

      var button = new Button();
      this.button = button;

      button.config.set({ text: 'Load Graph' });
      button.on('click', function () {
        var controls = _.object(_this2._controls.map(function (control) {
          var _control$config$attri = control.config.attributes,
              name = _control$config$attri.name,
              value = _control$config$attri.value;

          return [name, value];
        }));

        _this2._loader(controls, _this2.onDataReceived.bind(_this2), _this2.onErrorOccurred.bind(_this2));
      });

      this.append(button);
    },
    _displayNotConfiguredError: function _displayNotConfiguredError() {
      return '<div class="alert alert-danger">' + 'Block not configured. Please check configuration: ' + '<code>controls</code> and ' + '<code>loader</code>' + '</div>';
    },
    onDataReceived: function onDataReceived(data) {
      this.getGraph().setGraphData(data);
    },
    onErrorOccurred: function onErrorOccurred(error) {
      alert(error);
    }
  });
});