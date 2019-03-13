"use strict";

/**
 * Base class for behavior classes.
 */
define(function (require) {

  const _ = require('underscore');
  const MountableManager = require('./Mountable');

  return class BehaviorsManager extends MountableManager {

    trigger(event, context) {
      _.mapObject(this.mounted, (b) => {
        b.trigger(event, context);
      });
    }

  }

});
