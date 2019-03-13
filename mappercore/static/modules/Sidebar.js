"use strict";

/**
 * Right side bar, contains block instances.
 */

define(function () {
  var _window = window,
      _ = _window._,
      _window$b = _window.b,
      View = _window$b.View,
      Model = _window$b.Model,
      guard = _window.guard;


  return View.extend({

    template: _.template('<div class="block">' + '    <div class="block__title" data-toggle="collapse"\n' + '         for="<%= id %>" href="#<%= id %>"\n' + '         aria-expanded="true" aria-controls="block-<%= id %>"><%= title %></div>\n' + '    <div class="block__body collapse show" id="<%= id %>">\n' + '      <div class="block__body-inner" id="block-<%= id %>-body">\n' + '      </div>\n' + '    </div>\n' + ' </div>\n'),

    initialize: function initialize(states) {
      this.states = new Model(_.extend({
        app: null
      }, states));

      this.app = this.states.get('app');
      this._blocks = [];
    },
    addBlock: function addBlock(module, config) {
      if (typeof module !== 'function') {
        throw "blocks module is required";
      }

      var id = 'block-' + this._blocks.length + 1;
      var title = guard(config['title'], function () {
        return module.prototype.name;
      });
      var template = this.template({ id: id, title: title });

      this.$el.append(template);

      config = _.extend(config, {
        el: '#block-' + id + '-body',
        app: this.app,
        title: title
      });

      this._blocks.push(new module(config));
    },
    render: function render() {
      _.map(this._blocks, function (p) {
        return p.render();
      });
    }
  });
});