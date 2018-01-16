define(['underscore', 'jquery', 'backbone'], function (_, $, Backbone) {

  var app = function () {
  };

  _.extend(app.prototype, Backbone.Events, {

    name: null,

    baseUrl: function () {
      return '/app/' + this.name
    },

    callback: function (endpoint, data) {
      return $.ajax({
        type: "POST",
        url: this.baseUrl() + '/callbacks/' + endpoint,
        data: data
      });
    },

    getJSON: function (filename) {
      return $.getJSON('/static/' + this.name + '/' + filename);
    }

  });

  return new app();
});
