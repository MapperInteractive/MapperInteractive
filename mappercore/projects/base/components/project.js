define(['jquery', 'backbone'], function ($, Backbone) {
  "use strict";

  var ProjectModel = Backbone.Model.extend({
    name: null
  });

  function Project(name) {
    if (!(this instanceof Project)) {
      throw new TypeError("Project constructor cannot be called as a function.");
    }
    this.name = name;
    this.model = new ProjectModel();
  }

  Project.create = function (name) {
    return new Project(name);
  };

  Project.prototype = {
    constructor: Project,

    init: function () {
      throw new TypeError("Override this method to init your project.");
    },

    url: function (path) {
      return '/' + this.name + '/' + path;
    },

    callback: function (name, data) {
      return $.ajax({
        type: "POST",
        url: this.baseUrl() + '/callbacks/' + name,
        data: data
      });
    }
  };

  return Project;

});
