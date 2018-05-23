define(function (require) {
  let {Backbone} = require('lib');

  return Backbone.View.extend({

    initialize: function (config) {
      this.model = new Backbone.Model(config);

      // you can use the following shortcuts in your panel
      this.app = this.model.get('app');
      this.graph = this.app.graph;

      this.didMount();
    },

  });
});
