"use strict";

/**
 * Base class for behavior classes.
 */
define( (require) =>{

  const { _ } = window;
  const MountableManager = require('./Mountable');

  return class PluginsManager extends MountableManager {

    trigger(event, context) {
      _.mapObject(this.mounted, (b) => {
        b.trigger(event, context);
      });
    }

  }

});
