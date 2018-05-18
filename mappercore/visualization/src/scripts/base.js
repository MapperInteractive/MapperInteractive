define(function (require) {

  let Job = require('core/job');
  let {View, Model} = require('backbone');
  let _ = require('underscore');
  let Customization = require('./customization');

  /**
   * This App provides a class for creating different kinds of analysis tools
   * Do not use this class directly, extend it instead.
   */
  return View.extend({

    initialize(states) {

      this.states = new Model(_.extend({
        root: '#root',
        baseURL: '',
        title: 'Mapper',
        customizations: {},
      }, states));

      this.willMount();

      this.setElement(this.states.get('root'));
      this.customizations = new Model(this.states.get('customizations'));

      this.didMount();
    },

    willMount() {
    },

    didMount() {
    },

    /**
     * Call this method to generate the url for your app.
     * Don't hard code URL.
     *
     * @param path
     * @returns {string}
     */
    url(path) {
      return [this.states.get('baseURL'), 'app', path].join('/');
    },

    render() {
      let el = window.document.getElementsByTagName('title')[0];
      el.textContent = this.states.get('title');

      this.layout.render();
    },

    customize(name) {
      return new Customization(name);
    },

    job(name, params) {
      return new Job(name, params)
    }
  });
});
