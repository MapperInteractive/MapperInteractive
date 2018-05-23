define(function (require) {
  let {_} = require('lib');
  let Range = require('core/ui/form/range');
  let Button = require('core/ui/form/button');
  let Panel = require('../panel');

  const FORM_CONTROLS = {
    'range': Range
  };

  return Panel.extend({

    name: 'Graph Loader',

    didMount() {
      this.filters = this.model.get('filters');
      this.loader = this.model.get('loader');

      this.on('data', (data) => {
        this.graph.loadData(data);
      });

      this.on('error', (error) => {
        console.log(error);
      });
    },

    render() {
      if (!this.filters || !this.loader) {
        return this.$el.html(this._notConfiguredError());
      }

      let controls = [];

      this.filters.map((param) => {
        let container = $('<div></div>');
        container.appendTo(this.$el);

        let controlClass = FORM_CONTROLS[param['type']];
        delete param['type'];
        let control = new controlClass({el: container});
        control.states.set(param);
        controls.push(control);
        control.render();
      });

      let container = $('<div></div>');
      container.appendTo(this.$el);
      let button = new Button({el: container});
      this.button = button;

      button.states.set({text: 'Load Graph'});

      button.on('click', () => {
        let values = _.object(controls.map((control) => {
          let {name, value} = control.states.attributes;
          return [name, value];
        }));

        this.loader(this, values);
      });
      button.render();
    },

    _notConfiguredError() {
      return '<div class="alert alert-danger">' +
        'Panel not configured. Please check configuration: ' +
        '<code>filters</code> and ' +
        '<code>loaders</code>' +
        '</div>';
    }
  });
});
