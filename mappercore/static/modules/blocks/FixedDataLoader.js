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

define(function (require) {

  var Block = require('Block');

  return Block.extend({

    name: 'Fixed Data Source',

    didMount: function didMount() {
      var _this = this;

      this.loader = this.config.get('loader');

      this.on('data', function (data) {
        _this.graph.updateData(data);
      });

      this.on('error', function (error) {
        console.log(error);
      });
    },
    render: function render() {
      if (!this.loader) {
        return this.$el.html(this._notConfiguredError());
      } else {
        this.loader(this);
        var description = this.config.get('description');
        if (!description) {
          description = 'No description provided.';
        }
        return this.$el.html(description);
      }
    },
    _notConfiguredError: function _notConfiguredError() {
      return '<div class="alert alert-danger">' + 'Block not configured. Please check configuration: ' + '<code>loader</code>' + '</div>';
    }
  });
});