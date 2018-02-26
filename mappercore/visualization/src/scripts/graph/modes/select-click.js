define(function (require) {

  const GraphMode = require('../mode');
  const d3 = require('d3');

  return class SelectClickMode extends GraphMode {

    constructor() {
      super();
      this.name = 'select-click';
      this.label = 'click to select node';
    }

    willMount() {
      super.willMount()
    }

    didMount() {
      this.draggable = this.graph.behaviors.get('draggable');
    }

    willActivate() {
      if (this.draggable) {
        this.draggable.pause();
      }
    }

    didActivate() {
      super.didActivate();
      this.listenTo('node:click', (e) => {
        let target = d3.select(e.target);
        target.classed('selected', !target.classed('selected'));

        let selection = this.graph.container.selectAll('.node.selected').data();
        this.graph.trigger('nodes:select', selection);
      });
    }

    willDeactivate() {
      if (this.draggable) {
        this.draggable.resume();
      }
    }

    didDeactivate() {
      super.didDeactivate();
      this.stopListening();
    }
  }

})
;
