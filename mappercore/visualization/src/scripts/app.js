define(function (require) {

  let Backbone = require('backbone');
  let d3 = require('d3');

  return {

    Backbone: Backbone,
    d3: d3,
    ViewModel: Backbone.Model.extend(),

    defineComponent: function (arg) {
      return Backbone.View.extend(arg);
    }

  }

});
