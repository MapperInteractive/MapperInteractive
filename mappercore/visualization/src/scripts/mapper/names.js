define(function () {

  return {
    MIDDLEWARE_GRAPH_ENABLE_MODES: 'graph.enable.modes',
    MIDDLEWARE_GRAPH_ENABLE_BEHAVIORS: 'graph.enable.behaviors',

    CLASS_NAME_VERTEX: 'viewer-graph__vertex',
    CLASS_NAME_EDGE: 'viewer-graph__edge',
    CLASS_NAME_SELECTED: '--selected',
    CLASS_NAME_UNAVAILABLE: '--unavailable',
    CLASS_NAME_CANDIDATE: '--candidate',

    EVENT_LINK_CLICK: 'link:click',
    EVENT_LINK_MOUSEOVER: 'link:mouseover',
    EVENT_LINK_MOUSEOUT: 'link:mouseout',

    EVENT_NODE_CLICK: 'node:click',
    EVENT_NODE_MOUSEOVER: 'node:mouseover',
    EVENT_NODE_MOUSEOUT: 'node:mouseout',
    EVENT_NODE_MOUSEENTER: 'node:mouseenter',

    EVENT_GRAPH_WILL_RENDER: 'graph:willRender',
    EVENT_GRAPH_DID_RENDER: 'graph:didRender',

    EVENT_GRAPH_WILL_LOAD: 'graph:didLoad',
    EVENT_GRAPH_DID_LOAD: 'graph:didLoad',

    EVENT_GRAPH_CHANGE_SELECT: 'graph:change:select',

    EVENT_MIDDLEWARE_CHANGE: 'graph:change:middleware',
    EVENT_MIDDLEWARE_CHANGE_PREFIX: 'graph:change:middleware:',

    EVENT_MODE_ACTIVATED: 'mode:activated',
  }

});
