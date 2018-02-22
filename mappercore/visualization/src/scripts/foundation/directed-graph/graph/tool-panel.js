define(function (require) {

  var App = require('app');
  var _ = require('underscore');
  var $ = require('jquery');


  return App.defineComponent({

    template: _.template('<label data-mode-name="<%= name %>" class="btn btn-secondary <%if (isDefault) { %>active<% }%>">' +
      '<input type="radio" name="<%= name %>" autocomplete="off" <%if (isDefault) { %>checked<% }%>>' +
      '<%= label %>' +
      '</label>'),


    initialize: function () {
      this.model = new App.ViewModel({
        mountedModes: [
          {name: 'view', label: 'View', isDefault: true},
          {name: 'node-selection', label: 'Node Selection', isDefault: false},
          // {name: 'path-selection', label: 'Path Selection', isDefault: false}
        ]
      });
    },

    linkToGraph: function (graph) {
      this.model.set('graph', graph)
    },

    render: function () {
      // console.log(['render', this.model.get('graph')]);
      // this.$el.html("aa");
      this.$el.append('<div class="btn-group-vertical btn-group-toggle" data-toggle="buttons"></div>');
      var container = this.$('.btn-group-vertical');
      var template = this.template;
      _.map(this.model.get('modes'), function (mode) {
        container.append(template(mode));
      });
      var graph = this.model.get('graph');
      this.$('label.btn').click(function (e) {
        e.preventDefault();
        graph.switchMode($(e.target).data('mode-name'));
      });
    }

  });

});
