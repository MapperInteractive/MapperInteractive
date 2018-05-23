define(function (require) {

  let {_, Backbone: {Events}} = require('lib');

  return class Job {

    constructor(app, jobName, jobParams) {
      this.app = app;
      this._events = _.extend({}, Events);

      this.name = jobName;
      this.params = jobParams;

      this.initialTimeout = 1000;
      this.wathTimeout = 2000;
    }

    on() {
      this._events.on(...arguments);
    }

    send() {
      $.ajax({
        type: 'POST',
        url: this.app.url('job'),
        data: JSON.stringify({name: this.name, params: this.params}),
        contentType: "application/json",
        dataType: "json",
      }).done((res) => {
        this._events.trigger('sent', res);
        setTimeout(() => this.watch(res['id']), this.initialTimeout);
      }).fail((err) => {
        this._events.trigger('error', err);
      });
    }

    watch(jobId) {
      $.ajax({
        type: 'GET',
        url: this.app.url('job/' + jobId),
        contentType: "application/json",
      }).fail((err) => {
        this._events.trigger('error', err);
      }).done((res) => {
        if (res['status'] === 'finished') {
          this._events.trigger('finished', res);
        } else {
          setTimeout(() => this.watch(jobId), this.wathTimeout);
        }
      });
    }
  }
});
