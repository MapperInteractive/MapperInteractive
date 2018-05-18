define(function (require) {
  const GraphBehavior = require('../behavior');
  const $ = require('jquery');
  const d3 = require('d3');

  return class Popover extends GraphBehavior {

    initialize() {
      this.name = 'popover';
      this.popover = $('<div class="popover" role="tooltip" style="position: absolute"><div class="popover-body">!!!</div></div>');
      this.EVENT_MIDDLEWARE_CHANGE = 'graph:change:middleware:behaviors.popover.content';
      this.middleware = null;
    }

    didMount() {
      super.didMount();
      this.popover.hide();
      $('body').append(this.popover);

      this.listenTo('graph:didRender', () => {
        this.onGraphDidRender();
      });

      this.listenTo(this.EVENT_MIDDLEWARE_CHANGE, (fn) => {
        this.middleware = fn;
      });

      window.addEventListener('scroll', () => this._adjustPosition());
    }

    onGraphDidRender() {

      if (!this.middleware) {
        return;
      }

      this.popover.hide();
      this.listenTo('node:mouseenter', (e) => {
        this.popover.find('.popover-body').html("");

        let target = d3.select(e.target);
        let datum = target.datum();
        let html = this.middleware(datum);

        this.popover.find('.popover-body').html(html);
        this._adjustPosition();
        this.popover.show();
      });
    }

    _adjustPosition() {
      if (!this.popover.is(":visible")) {
        return false;
      }

      let baseElement = this.graph.container.node();
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
