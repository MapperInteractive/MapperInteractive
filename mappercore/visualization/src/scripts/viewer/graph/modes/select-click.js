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
        target.classed(this.graph.CLASS_NAME_SELECTED, !target.classed(this.graph.CLASS_NAME_SELECTED));

        let selection = this.graph.nodesContainer.selectAll('.' + this.graph.CLASS_NAME_SELECTED).data();
        this.graph.trigger('change:selection', selection);
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
