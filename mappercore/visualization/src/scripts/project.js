define(function (require) {

  let $ = require('jquery');

  return class Project {

    constructor(name) {
      this.name = name;
      this.baseURL = '/' + this.name;
    }

    url(path) {
      return this.baseURL + '/' + path;
    }

    callback(name, data) {
      return $.ajax({
        type: "POST",
        url: this.baseURL + '/callbacks/' + name,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json"
      });
    }
  };


});
