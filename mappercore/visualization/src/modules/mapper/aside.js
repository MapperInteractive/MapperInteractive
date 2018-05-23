define(function (require) {

  let {Backbone: {Model, View}, _} = require('lib');

  return View.extend({

    template: _.template('<div class="panel">' +
      '    <div class="panel__title" data-toggle="collapse"\n' +
      '         for="<%= id %>" href="#<%= id %>"\n' +
      '         aria-expanded="true" aria-controls="panel-<%= id %>"><%= title %></div>\n' +
      '    <div class="panel__body collapse show" id="<%= id %>">\n' +
      '      <div class="panel__body-inner" id="panel-<%= id %>-body">\n' +
      '      </div>\n' +
      '    </div>\n' +
      ' </div>\n'),

    initialize(states) {
      this.states = new Model(_.extend({
        app: null,
      }, states));

      this.app = this.states.get('app');
      this._panels = [];
    },

    createPanel(config) {
      let Module = null;

      if (typeof config === 'function') {
        Module = config;
      } else {
        Module = _.guard(config['module'], () => {
          throw "panels module is required"
        });
      }

      let id = 'panel-' + this._panels.length + 1;
      let title = _.guard(config['title'], () => Module.prototype.name);
      let template = this.template({id: id, title: title});

      this.$el.append(template);

      config = _.extend(config, {
        el: '#panel-' + id + '-body',
        app: this.app,
        title: title,
      });

      this._panels.push(new Module(config));
    },

    render() {
      _.map(this._panels, (p) => p.render());
    }

  });
});
