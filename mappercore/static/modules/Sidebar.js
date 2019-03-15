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

    initialize: function initialize(config) {
      this.config = new Model(_.extend({
        app: null
      }, config));

      this.workspace = this.config.get('workspace');
      this._blocks = [];
    },
    addBlock: function addBlock(klass, config) {
      if (typeof klass !== 'function') {
        throw "blocks module is required";
      }

      var id = 'block-' + this._blocks.length + 1;
      var title = guard(config['title'], function () {
        return klass.prototype.name;
      });
      var template = this.template({ id: id, title: title });

      this.$el.append(template);

      var blockConfig = _.extend(config, {
        el: '#block-' + id + '-body',
        workspace: this.workspace,
        title: title
      });

      this._blocks.push(new klass(blockConfig));
    },
    render: function render() {
      _.map(this._blocks, function (p) {
        return p.render();
      });
    }
  });
});