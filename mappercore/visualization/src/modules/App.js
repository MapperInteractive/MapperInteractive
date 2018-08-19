"use strict";

/**
 * This App provides a class for creating different kinds of analysis tools.
 *  Do not use this class directly, extend it instead.
 */

define(function (require) {

  const { View, Model } = require('backbone');
  const _ = require('underscore');
  const $ = require('jquery');
  const { guard } = require('core/Helper');

  return View.extend({

    initialize(states) {
      this.model = new Model(_.extend({
        'baseUrl': '',
        'title': 'Mapper'
      }, states));

      this.willMount();
      this.setElement(guard(this.model.get('element'), '#root'));
      this.didMount();
    },

    hasOption(name) {
      return this.getOption(name) !== undefined;
    },

    getOption(name) {
      return guard(this.model.get('options'), {})[name];
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

    serverSideFunction(name, data, onData) {
      $.ajax({
        type: 'POST',
        url: `${this.url('call')}/${name}`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
      }).done((res) => {
        onData(res);
      });
    }
  });
});
