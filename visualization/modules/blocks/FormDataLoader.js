"use strict";

/**
 * Block for building a form to load graph data.
 */
define((require) => {
  const { _, $ } = window;

  const Block = require('Block');

  // HTML elements
  const Range = require('ui/form/Range');
  const Button = require('ui/form/Button');
  const Dropdown = require('ui/form/Dropdown');

  const FORM_CONTROLS = {
    'range': Range,
    'dropdown': Dropdown
  };

  return Block.extend({

    name: 'Graph Loader',

    didMount() {
      this.controls = this.model.get('controls');
      this.loader = this.model.get('loader');

      this.on('data', (data) => {
        this.graph.updateData(data);
      });

      this.on('error', (error) => {
        console.log(error);
      });
    },

    render() {
      if (!this.controls || !this.loader) {
        return this.$el.html(this._notConfiguredError());
      }

      let controls = [];

      this.controls.map((param) => {
        let container = $('<div></div>');
        container.appendTo(this.$el);

        let controlClass = FORM_CONTROLS[param['type']];
        delete param['type'];
        let control = new controlClass({ el: container });
        control.model.set(param);
        controls.push(control);
        control.render();
      });

      let container = $('<div></div>');
      container.appendTo(this.$el);
      let button = new Button({ el: container });
      this.button = button;

      button.model.set({ text: 'Load Graph' });

      button.on('click', () => {
        let values = _.object(controls.map((control) => {
          let { name, value } = control.model.attributes;
          return [name, value];
        }));

        this.loader(this, values);
      });
      button.render();
    },

    _notConfiguredError() {
      return '<div class="alert alert-danger">' +
        'Block not configured. Please check configuration: ' +
        '<code>controls</code> and ' +
        '<code>loader</code>' +
        '</div>';
    }
  });
});
