"use strict";

/**
 * Block for building a form to load graph data.
 */
define((require) => {
  const { _, $ } = window;

  const Block = require('Block');

  // HTML elements
  const Range = require('../form/Range');
  const Button = require('../form/Button');
  const Dropdown = require('../form/Dropdown');

  const FORM_CONTROLS = {
    'range': Range,
    'dropdown': Dropdown
  };

  return Block.extend({

    name: 'Graph Loader',

    didMount() {
      this._controls = this.config.get('form').map(this._initControl.bind(this));
      this._loader = this.config.get('loader');
    },

    render() {
      if (!this._controls || !this._loader) {
        return this.$el.html(this._displayNotConfiguredError());
      }

      this._renderControls();
      this._renderButton();
    },

    _initControl(control) {
      let controlClass = FORM_CONTROLS[control['type']];

      let view = new controlClass();
      view.config.set(control['config']);
      return view;
    },

    _renderControls() {
      this._controls.map((c) => this.append(c, 'div'));
    },

    _renderButton() {

      let button = new Button();
      this.button = button;

      button.config.set({ text: 'Load Graph' });
      button.on('click', () => {
        let controls = _.object(this._controls.map((control) => {
          let { name, value } = control.config.attributes;
          return [name, value];
        }));

        this._loader(controls, this.onDataReceived.bind(this), this.onErrorOccurred.bind(this));
      });

      this.append(button);
    },

    _displayNotConfiguredError() {
      return '<div class="alert alert-danger">' +
        'Block not configured. Please check configuration: ' +
        '<code>controls</code> and ' +
        '<code>loader</code>' +
        '</div>';
    },

    onDataReceived(data) {
      this.getGraph().setGraphData(data);
    },

    onErrorOccurred(error) {
      alert(error);
    },

  });
});
