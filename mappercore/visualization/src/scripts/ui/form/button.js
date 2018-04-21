define(function (require) {

  let Backbone = require('backbone');
  let ViewModel = Backbone.Model.extend();

  return Backbone.View.extend({

    template: _.template('<button class="btn btn-block ui-form-button"><%= text %></button>'),

    initialize: function () {
      this.model = new ViewModel({
        disable: false,
        text: 'Submit',
      });
      this.$el.addClass('form-group');
      this.button = $(this.template(this.model.attributes));

      this.listenTo(this.model, 'change:disable', () => {
        if (this.model.get('disable')) {
          this.button.addClass('disabled');
        } else {
          this.button.removeClass('disabled');
        }
      });

      this.listenTo(this.model, 'change:text', () => {
        this.button.text(this.model.get('text'));
      });
    },

    events: {
      'click': 'onClick'
    },

    onClick: function (e) {
      e.preventDefault();
      this.trigger('click');
    },

    render: function () {
      this.button.text(this.model.get('text'));
      this.$el.html(this.button);
    }
  });

});
