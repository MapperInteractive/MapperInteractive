"use strict";

/**
 * Common part for Behavior and Mode.
 *
 * You can create a new mechanism which can be mount to a graph.
 */
define(() => {

  const { _ } = window;

  return class AbstractManager {

    constructor(graph) {
      this.graph = graph;
      this.mounted = {};
    }

    add(mountable) {
      mountable.willMount();
      mountable.graph = this.graph;
      mountable.app = this.graph.app;
      this.mounted[mountable.name] = mountable;
      mountable.didMount();
    }

    has(name) {
      return this.mounted.hasOwnProperty(name);
    }

    get(name) {
      return this.mounted[name];
    }

    map(fn) {
      _.mapObject(this.mounted, fn);
    }
  };

});
