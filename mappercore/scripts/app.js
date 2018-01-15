define(['underscore', 'jquery'], function (_, $) {

  var app = function () {
  };

  _.extend(app.prototype, {

    name: null,

    callback: function (endpoint, data) {
      return $.ajax({
        type: "POST",
        url: '/' + this.name + '/callbacks/' + endpoint,
        data: data
      });
    }

  });

  return new app();
});
