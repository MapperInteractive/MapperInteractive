define(function (require) {

  let _ = require('underscore');
  let $ = require('underscore');

  class PanelWrapper {
    constructor(app, title, module) {
      this.app = app;
      this.module = module;
      this.title = title;

      this.template = _.template('<div class="panel">' +
        '    <div class="panel__title" data-toggle="collapse"\n' +
        '         for="<%= id %>" href="#<%= id %>"\n' +
        '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
        '    <div class="panel__body collapse show" id="<%= id %>">\n' +
        '      <div class="panel__body-inner">\n' +
        '      </div>\n' +
        '    </div>\n' +
        ' </div>\n');
    }

    render() {
      let id = 'panel-' + (this.app.panels.length + 1);
      let wrapper = $(this.template({id: id, title: this.title}));

      wrapper.appendTo(this.el);

      let inner = $('#' + id + ' .panel__body-inner:first-child');
      let constructor = this.module;
      let panel = new constructor({el: inner, graph: this.graph, app: this.app});

      panel.on('all', (...args) => {
        this.trigger(...args);
      });

      if (model) {
        panel.states.set(model);
      }

      this.panels.push(panel);
      return panel;
    }
  }

  return class PanelRegister {

    constructor(app) {
      this.app = app;
    }

    title(text) {
      this._title = text;
      return this;
    }

    script(module) {
      this._module = module;
      return this;
    }

    show() {
      let panel = new PanelWrapper(this.app, this._title, this._module);
      this.app.panels.push();
    }

    hiden() {

    }
  }


  // return Backbone.View.extend({
  //
  //   template: _.template('<div class="panel">' +
  //     '    <div class="panel__title" data-toggle="collapse"\n' +
  //     '         for="<%= id %>" href="#<%= id %>"\n' +
  //     '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
  //     '    <div class="panel__body collapse show" id="<%= id %>">\n' +
  //     '      <div class="panel__body-inner">\n' +
  //     '      </div>\n' +
  //     '    </div>\n' +
  //     ' </div>\n'),
  //
  //   initialize(conf) {
  //     console.log(conf);
  //     let {graph} = conf;
  //     this.graph = graph;
  //
  //     this.panels = [];
  //   },
  //
  //   add(conf) {
  //     let {title, constructor, model} = conf;
  //
  //     let id = 'panel-' + (this.panels.length + 1);
  //     let wrapper = $(this.template({id: id, title: title}));
  //
  //     wrapper.appendTo(this.el);
  //
  //     let inner = this.$('#' + id + ' .panel__body-inner:first-child');
  //     let panel = new constructor({el: inner, graph: this.graph, app: this.app});
  //
  //     panel.on('all', (...args) => {
  //       this.trigger(...args);
  //     });
  //
  //     if (model) {
  //       panel.states.set(model);
  //     }
  //
  //     this.panels.push(panel);
  //     return panel;
  //   },
  //
  //   render() {
  //     this.panels.map((p) => p.render());
  //   },
  //
  // });
});
