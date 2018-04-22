define(function (require) {
  let Backbone = require('backbone');
  let _ = require('underscore');
  let Range = require('core/ui/form/range');
  let Button = require('core/ui/form/button');

  const FORM_CONTROLS = {
    'range': Range
  };

  return Backbone.View.extend({

    name: 'loaders.static_files',

    initialize: function (states) {
      this.model = new Backbone.Model(_.extend({
        graph: null,
        data: null,
        error: null,
        params: [],
        request: undefined,
      }, states));

      this.graph = this.model.get('graph');

      this.listenTo(this.model, 'change:error', () => {
        // pass
      });

      this.listenTo(this.model, 'change:data', () => {
        let {data, params} = this.model.attributes;
        this.graph.model.set({data, params});
      });
    },

    render: function () {
      let controls = [];

      this.model.get('params').map((param) => {

        let container = $('<div></div>');
        container.appendTo(this.$el);

        let controlClass = FORM_CONTROLS[param['type']];
        delete param['type'];
        let control = new controlClass({el: container});
        control.model.set(param);
        controls.push(control);
        control.render();
      });

      let container = $('<div></div>');
      container.appendTo(this.$el);
      let button = new Button({el: container});
      this.button = button;

      button.model.set({text: 'Load Graph'});

      button.on('click', () => {
        this.trigger('LOADER:WILL_REQUEST');

        let params = _.object(controls.map((control) => {
          let {name, value} = control.model.attributes;
          return [name, value];
        }));

        let request = this.model.get('request');
        request(params, this);
      });
      button.render();
    }
  });
});
