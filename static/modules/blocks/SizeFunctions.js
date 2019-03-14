define((require) => {

  const { d3 } = window;
  const Block = require('Block');

  return Block.extend({

    name: 'Size',

    didMount() {
      this.config.set('functions', this.config.get('functions'));
      this.config.set('currentFunction', this.config.get('functions')[0]);

      this.listenTo(this.config, 'change:currentFunction', () => this._onCurrentSizeFunctionChange());
      this.listenTo(this.graph.model, 'change:data', () => this._whenGraphDataChanged());
    },

    render() {
      let $container = $('<div class="btn-group" role="group"></div>');

      this.config.get('functions').map((func) => {
        let $btn = $('<button type="button" class="btn btn-outline-secondary">' + func['name'] + '</button>');
        $btn.on('click', () => {
          $container.find('.active').removeClass('active');
          $btn.addClass('active');
          this.config.set('currentFunction', func);
        });
        $container.append($btn);
      });

      this.$el.append($container);
    },

    _whenGraphDataChanged() {
      this._updateSize();
    },

    _onCurrentSizeFunctionChange() {
      this._updateSize();
    },

    _updateSize() {
      let data = this.graph.model.get('data');
      let nodes = this.graph.nodes;

      if (!nodes) {
        return false;
      }

      let currentFunction = this.config.get('currentFunction');
      let valueParser = currentFunction['func'];

      if (!valueParser) {
        nodes.transition().style('r', null);
        return;
      }

      let sizeDomain = d3.extent(data['nodes'], (d) => valueParser(d));
      let sizeRange = [10, 20];
      let sizeScale = d3.scaleLinear().domain(sizeDomain).range(sizeRange);

      nodes.each(function (d) {
        d3.select(this).transition().style("r", sizeScale(valueParser(d)));
      });
    }
  });

});
