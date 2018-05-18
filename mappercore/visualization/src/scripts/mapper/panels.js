define(function (require) {

  let Backbone = require('backbone');
  let _ = require('underscore');

  return Backbone.View.extend({

    template: _.template('<div class="panel">' +
      '    <div class="panel__title" data-toggle="collapse"\n' +
      '         for="<%= id %>" href="#<%= id %>"\n' +
      '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
      '    <div class="panel__body collapse show" id="<%= id %>">\n' +
      '      <div class="panel__body-inner">\n' +
      '      </div>\n' +
      '    </div>\n' +
      ' </div>\n'),

    initialize(conf) {
      let {graph} = conf;
      this.graph = graph;

      this.panels = [];
    },

    add(conf) {
      let {title, constructor, model} = conf;

      let id = 'panel-' + (this.panels.length + 1);
      let wrapper = $(this.template({id: id, title: title}));

      wrapper.appendTo(this.el);

      let inner = this.$('#' + id + ' .panel__body-inner:first-child');
      let panel = new constructor({el: inner, graph: this.graph});

      panel.on('all', (...args) => {
        this.trigger(...args);
      });

      if (model) {
        panel.states.set(model);
      }

      this.panels.push(panel);
      return panel;
    },

    render() {
      this.panels.map((p) => p.render());
    },

  });
});
