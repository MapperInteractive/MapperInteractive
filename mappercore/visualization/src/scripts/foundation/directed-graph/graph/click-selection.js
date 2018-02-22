define(function (require) {

  const Mode = require('./mode');
  const d3 = require('d3');

  class ClickSelectMode extends Mode {

    mount() {
      this.graph.on('render', () => this.reviewContext);
      this.graph.on('nodeClicked', () => this.onNodeClicked);
    }

    unmount() {
      //
    }

    onNodeClicked(e) {
      let target = d3.select(e.target);
      let selection = this.graph.container.selectAll('.node.selected').data();

      target.classed('selected', !target.classed('selected'));
      this.graph.trigger('nodeSelectionChanged', selection);
    }

    reviewContext() {
      this.draggable = this.graph.getBehavior('draggable');

      let updateMode = function (inverse) {
        return function () {
          let triggered = [91, 17].indexOf(d3.event.keyCode) >= 0;

          if (inverse) {
            triggered = !triggered;
          }

          if (this.draggable) {
            if (triggered) {
              this.draggable.pause();
            } else {
              this.draggable.resume();
            }
          }

        }.bind(this);
      }.bind(this);

      d3.select('body')
        .on('keydown', updateMode())
        .on('keyup', updateMode(true));
    }
  }

  return ClickSelectMode;
});
