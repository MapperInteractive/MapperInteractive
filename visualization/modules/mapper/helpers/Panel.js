"use strict";

/**
 * Base class for the Pane.
 */
define(function (require) {

  const _ = require('underscore');
  const $ = require('jquery');

  class PaneWrapper {
    constructor(app, title, module) {
      this.app = app;
      this.module = module;
      this.title = title;

      this.template = _.template('<div class="pane">' +
        '    <div class="pane__title" data-toggle="collapse"\n' +
        '         for="<%= id %>" href="#<%= id %>"\n' +
        '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
        '    <div class="pane__body collapse show" id="<%= id %>">\n' +
        '      <div class="pane__body-inner">\n' +
        '      </div>\n' +
        '    </div>\n' +
        ' </div>\n');
    }

    render() {
      let id = 'pane-' + (this.app.panes.length + 1);
      let wrapper = $(this.template({ id: id, title: this.title }));

      wrapper.appendTo(this.el);

      let inner = $('#' + id + ' .pane__body-inner:first-child');
      let constructor = this.module;
      let pane = new constructor({ el: inner, graph: this.graph, app: this.app });

      pane.on('all', (...args) => {
        this.trigger(...args);
      });

      if (model) {
        pane.states.set(model);
      }

      this.panes.push(pane);
      return pane;
    }
  }

  return class PaneRegister {

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
      let pane = new PaneWrapper(this.app, this._title, this._module);
      this.app.panes.push();
    }

    hiden() {

    }
  }


  // return Backbone.View.extend({
  //
  //   template: _.template('<div class="pane">' +
  //     '    <div class="pane__title" data-toggle="collapse"\n' +
  //     '         for="<%= id %>" href="#<%= id %>"\n' +
  //     '         aria-expanded="true" aria-controls="<%= id %>"><%= title %></div>\n' +
  //     '    <div class="pane__body collapse show" id="<%= id %>">\n' +
  //     '      <div class="pane__body-inner">\n' +
  //     '      </div>\n' +
  //     '    </div>\n' +
  //     ' </div>\n'),
  //
  //   initialize(conf) {
  //     console.log(conf);
  //     let {graph} = conf;
  //     this.graph = graph;
  //
  //     this.panes = [];
  //   },
  //
  //   add(conf) {
  //     let {title, constructor, model} = conf;
  //
  //     let id = 'pane-' + (this.panes.length + 1);
  //     let wrapper = $(this.template({id: id, title: title}));
  //
  //     wrapper.appendTo(this.el);
  //
  //     let inner = this.$('#' + id + ' .pane__body-inner:first-child');
  //     let pane = new constructor({el: inner, graph: this.graph, app: this.app});
  //
  //     pane.on('all', (...args) => {
  //       this.trigger(...args);
  //     });
  //
  //     if (model) {
  //       pane.states.set(model);
  //     }
  //
  //     this.panes.push(pane);
  //     return pane;
  //   },
  //
  //   render() {
  //     this.panes.map((p) => p.render());
  //   },
  //
  // });
});
