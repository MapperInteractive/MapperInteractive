"use strict";

/**
 * Pane for building a form to load graph data.
 */
define(function (require) {
  const _ = require('underscore');
  const $ = require('jquery');
  const Range = require('core/ui/form/Range');
  const Button = require('core/ui/form/Button');
  const Pane = require('../Pane');

  const FORM_CONTROLS = {
    'range': Range
  };

  return Pane.extend({

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
        control.states.set(param);
        controls.push(control);
        control.render();
      });

      let container = $('<div></div>');
      container.appendTo(this.$el);
      let button = new Button({ el: container });
      this.button = button;

      button.states.set({ text: 'Load Graph' });

      button.on('click', () => {
        let values = _.object(controls.map((control) => {
          let { name, value } = control.states.attributes;
          return [name, value];
        }));

        this.loader(this, values);
      });
      button.render();
    },

    _notConfiguredError() {
      return '<div class="alert alert-danger">' +
        'Pane not configured. Please check configuration: ' +
        '<code>controls</code> and ' +
        '<code>loader</code>' +
        '</div>';
    }
  });
});
