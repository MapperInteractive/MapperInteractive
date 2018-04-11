define(function (require) {

  let Backbone = require('backbone');
  let ViewModel = Backbone.Model.extend();

  return Backbone.View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function () {
      this.model = new ViewModel({
        text: 'Submit',
      });
      this.$el.addClass('form-group');
    },

    events: {
      'click': 'onClick'
    },

    onClick: function (e) {
      e.preventDefault();
      this.trigger('click');
    },

    render: function () {
      this.$el.html(this.template(this.model.attributes));
    }
  });

});
