define(function (require) {

  const GraphMode = require('../mode');
  const d3 = require('d3');

  return class SelectClickMode extends GraphMode {

    didMount() {
      this.draggable = this.graph.behaviors.get('Draggable');
    }

    willActivate() {
      if (this.draggable) {
        this.draggable.pause();
      }
    }

    didActivate() {
      super.didActivate();
      this.listenTo('node:clicked', (e) => {
        let target = d3.select(e.target);
        let selection = this.graph.container.selectAll('.node.selected').data();

        target.classed('selected', !target.classed('selected'));
        this.graph.trigger('node:selected', selection);
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
