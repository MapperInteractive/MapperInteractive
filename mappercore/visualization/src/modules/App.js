"use strict";

/**
 * This App provides a class for creating different kinds of analysis tools.
 *  Do not use this class directly, extend it instead.
 */

define(function (require) {

  const { Backbone: { View, Model }, _ } = require('core/Lib');

  return View.extend({

    initialize(config) {
      this.model = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, config));

      this.willMount();
      this.setElement(_.guard(this.model.get('element'), '#root'));
      this.didMount();
    },

    willMount() {
    },

    didMount() {
    },

    /**
     * Call this method to generate the url for your app.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url(path) {
      return [this.model.get('baseURL'), 'app', path].join('/');
    },

    render() {
      // abstract method
    },

    serverSideFunction(name, params, onData) {
      $.ajax({
        type: 'POST',
        url: this.app.url('sop'),
        data: JSON.stringify({ name: name, params: params }),
        contentType: "application/json",
        dataType: "json",
      }).done((res) => {
        onData(res);
      });
    }
  });
});
