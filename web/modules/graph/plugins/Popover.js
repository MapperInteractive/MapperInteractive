"use strict";

/**
 * Enable graph showing popover when use hover a node.
 */
define((require) => {

  const { d3, $ } = window;
  const GraphBehavior = require('../Plugin');

  return class Popover extends GraphBehavior {

    initialize() {
      this.name = 'popover';
      this.popover = $('<div class="popover" role="tooltip" style="position: absolute"><div class="popover-body">!!!</div></div>');
    }

    didMount() {
      super.didMount();

      this.popover.hide();
      $('body').append(this.popover);

      this.listenTo(this.graph, 'didRender', () => {
        this._onDidRender();
      });

      window.addEventListener('scroll', () => this._adjustPosition());
    }

    _onDidRender() {
      this.popover.hide();
      this.listenTo(this.graph, 'mouseenter:node', (e) => {
        this.popover.find('.popover-body').html("");

        let target = d3.select(e.target);
        let datum = target.datum();

        let contentFunction = this.app.getOption('behavior.popover.content');
        if (!contentFunction) {
          return null;
        }
        let html = contentFunction(datum);

        this.popover.find('.popover-body').html(html);
        this._adjustPosition();
        this.popover.show();
      });
    }

    _adjustPosition() {
      if (!this.popover.is(":visible")) {
        return false;
      }

      let baseElement = this.graph.svg.node();
      let basePosition = baseElement.getBoundingClientRect();

      let left = basePosition.left;
      let top = basePosition.top;

      if (top < 0) {
        top = window.scrollY;
      }

      this.popover.css('top', top + 10);
      this.popover.css('left', left + 10);
    }
  }
});
