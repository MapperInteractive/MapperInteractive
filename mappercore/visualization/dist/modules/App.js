"use strict";

/**
 * This App provides a class for creating different kinds of analysis tools.
 *  Do not use this class directly, extend it instead.
 */

define(function (require) {
  var _require = require('backbone'),
      View = _require.View,
      Model = _require.Model;

  var _ = require('underscore');

  var _require2 = require('core/Helper'),
      guard = _require2.guard;

  return View.extend({
    initialize: function initialize(config) {
      this.model = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, config));

      this.willMount();
      this.setElement(guard(this.model.get('element'), '#root'));
      this.didMount();
    },
    willMount: function willMount() {},
    didMount: function didMount() {},


    /**
     * Call this method to generate the url for your app.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url: function url(path) {
      return [this.model.get('baseURL'), 'app', path].join('/');
    },
    render: function render() {
      // abstract method
    },
    serverSideFunction: function serverSideFunction(name, params, onData) {
      $.ajax({
        type: 'POST',
        url: this.app.url('sop'),
        data: JSON.stringify({ name: name, params: params }),
        contentType: "application/json",
        dataType: "json"
      }).done(function (res) {
        onData(res);
      });
    }
  });
});