"use strict";

/**
 * Base class for behavior classes.
 */
define((require) => {

  const { _ } = window;
  const AbstractManager = require('./Abstract');

  return class BlocksManager extends AbstractManager {

    trigger(event, context) {
      _.mapObject(this.mounted, (b) => {
        b.trigger(event, context);
      });
    }
  };
});
