define(function () {

  return class Customization {

    constructor(name, app) {
      this.app = app;
      this.name = name;
      this._isRequired = false;
      this._default = null;
      this._params = [];
    }

    required() {
      this._isRequired = true;
      return this;
    }

    params(...values) {
      this._params = this._params.concat(values);
      return this;
    }

    fallback(value) {
      this._default = value;
      return this;
    }

    invoke() {
      let fn = this.app.customizations.get(this.name);

      if (!fn) {
        if (this._isRequired) {
          throw "Customization " + this.name + ' is required.';
        } else {
          return this._default;
        }
      }

      if (this._params) {
        return fn(...this._params.concat(this.app));
      } else {
        return fn(this.app);
      }
    }
  }

});
