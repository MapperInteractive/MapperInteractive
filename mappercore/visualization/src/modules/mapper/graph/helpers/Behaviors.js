"use strict";

/**
 * Base class for behavior classes.
 */
define(function (require) {

  const _ = require('underscore');
  const MountableHelper = require('./Mountable');

  return class BehaviorsHelper extends MountableHelper {

    trigger(event, context) {
      _.mapObject(this.mounted, (b) => {
        b.trigger(event, context);
      });
    }

  }

});
