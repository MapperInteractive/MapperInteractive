"use strict";

/**
 * Load a single static file from server.
 *
 * Required config:
 *
 *    - loader. A function that provides a fixed data to the graph.
 *
 * Events:
 *
 *    - data. pass data to graph
 *    - error, display error data in console
 */
define((require) => {

  const Block = require('Block');

  return Block.extend({

    name: 'Fixed Data Source',

    didMount() {
      this._loader = this.config.get('loader');

      this.on('data', (data) => {
        this.getGraph().setGraphData(data);
      });

      this.on('error', (error) => {
        console.error(error);
      });
    },

    render() {
      if (!this._loader) {
        return this.$el.html(this._displayNotConfiguredError());
      } else {
        this._loader(this);
        let description = this.config.get('description');
        if (!description) {
          description = 'No description provided.'
        }
        return this.$el.html(description)
      }
    },

    _displayNotConfiguredError() {
      return '<div class="alert alert-danger">' +
        'Block not configured. Please check configuration: ' +
        '<code>loader</code>' +
        '</div>';
    }
  });
});
