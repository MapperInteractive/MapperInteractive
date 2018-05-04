define(function (require) {

  let $ = require('jquery');
  let Job = require('core/job');
  let Backbone = require('backbone');
  let AppModel = Backbone.Model.extend({});

  return Backbone.View.extend({

    initialize: function (params) {
      this.setElement('#root');

      this.model = new AppModel({
        title: 'Mapper',
      });

      this.listenTo(this.model, 'change:title', () => this.onTitleChange());
      this.configure(params);
      this.baseURL = '';

      window.app = this;
    },

    configure: function (params) {
      if (!params) {
        throw "App params required";
      }

      if (!params['layout']) {
        throw "App params [layout] required";
      }
      this.layout = new params['layout']({el: this.el});

      if (params['title']) {
        this.model.set('title', params['title']);
      }
    },

    url(path) {
      return this.baseURL + '/app/' + path;
    },

    title: function (title) {
      this.model.set('title', title)
    },

    onTitleChange: function () {
      let el = window.document.getElementsByTagName('title')[0];
      el.textContent = this.model.get('title');
    },

    render: function () {
      this.layout.render();
    },

    model: function (attributes = {}) {
      let model = Backbone.Model.extend();
      return new model(attributes);
    },

    createJob: function (name, params) {
      return new Job(name, params)
    }
  });
});
