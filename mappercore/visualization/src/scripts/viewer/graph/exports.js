define(function (require) {

  const App = require('app');
  const _ = require('underscore');
  const $ = require('jquery');

  let Backbone = require('backbone');
  let ViewModel = Backbone.Model.extend();


  return App.defineComponent({

    template: _.template('<a href="#">individuals [<span>0</span>]</a>'),

    initialize: function () {
      this.columns = "id,x,tx,tcal,bf1,bf2,bf3,bf4,bf5,bf6,bf7,bf8,bf9,bf10,age,sex".split(',');
      this.model = new ViewModel({
        items: null,
      });
    },

    setGraph: function (graph) {
      this.graph = graph;
    },

    updateSelection: function (selection) {
      let individuals = {};
      this.model.get('items').forEach((item) => {
        individuals[item['id']] = item;
      });

      this.rows = [
        this.columns
      ];
      selection.forEach((node) => {
        node.children.forEach((child) => {
          let individual = individuals[child['name']];
          this.rows.push(this.columns.map((column) => {
            return individual[column];
          }))
        })
      });

      let fileContent = "data:text/csv;charset=utf-8,";
      this.rows.forEach(function (row) {
        fileContent += row.join(",") + "\r\n";
      });
      let fileURI = encodeURI(fileContent);

      let link = this.$('a');
      link.attr('download', "exports.csv");
      link.attr('href', fileURI);

      this.$('a span').text(this.rows.length);
    },

    render: function () {
      this.$(".panel__body-inner").html(this.template());
    }

  });

});
