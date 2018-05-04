define(function (require) {

  let $ = require('jquery');
  let Backbone = require('backbone');

  return Backbone.View.extend({

    initialize: function (name, params) {
      this.name = name;
      this.params = params;
      this.app = window.app;
      this.initialTimeout = 1000;
      this.wathTimeout = 2000;
    },

    send: function () {
      $.ajax({
        type: 'POST',
        url: this.app.baseURL + '/job',
        data: JSON.stringify({name: this.name, params: this.params}),
        contentType: "application/json",
        dataType: "json",
      }).done((res) => {
        this.trigger('sent', res);
        setTimeout(() => this.watch(res['id']), this.initialTimeout);
      }).fail((err) => {
        this.trigger('error', err);
      });
    },

    watch: function (jobId) {
      $.ajax({
        type: 'GET',
        url: this.app.baseURL + '/job/' + jobId,
        contentType: "application/json",
      }).fail((err) => {
        this.trigger('error', err);
      }).done((res) => {
        if (res['status'] === 'finished') {
          this.trigger('finished', res);
        } else {
          setTimeout(() => this.watch(jobId), this.wathTimeout);
        }
      });
    }

  });
});
