define(function (require) {

  let Backbone = require('backbone');
  let d3 = require('d3');

  return {

    // References

    Backbone: Backbone,
    d3: d3,
    View: Backbone.View,

    // shortcuts

    defineComponent: function (arg) {
      return Backbone.View.extend(arg);
    },

    component: function (viewClass, element, model) {
      let view = new viewClass({el: element});
      view.model.set(model);
      return view;
    },

    view: function (args) {
      return Backbone.View.extend(args);
    },

    model: function (attributes = {}) {
      let model = Backbone.Model.extend();
      return new model(attributes);
    },



  }

});
