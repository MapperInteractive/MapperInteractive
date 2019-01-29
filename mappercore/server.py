import inspect
import jinja2

from os import path
from flask import Flask, render_template, jsonify, request

from .layer import Layer


class Server:

    def __init__(self, root_path=None):

        if not root_path:
            self.root_path = self._auto_find_root_path()
        else:
            self.root_path = path.abspath(root_path)

        self.runnable = None
        self.exports = {}
        self.runnable = self._make_flask_instance()

    def __call__(self, *args, **kwargs):
        return self.runnable(*args, **kwargs)

    def register_function(self, name, func):
        self.exports[name] = func

    @staticmethod
    def _auto_find_root_path():
        """
        your_script.py (2) => server.py (1) => _find_root_path
        """
        frame = inspect.stack()[2]
        module = inspect.getmodule(frame[0])
        return path.dirname(path.abspath(module.__file__))

    def _make_flask_instance(self):
        flask = Flask(__name__, static_folder=None)
        layers = {
            'core': Layer('core', root_path=path.join(path.dirname(__file__), 'static')),
            'app': Layer('app', root_path=self.root_path),
        }

        flask.jinja_loader = jinja2.PrefixLoader({
            k: jinja2.FileSystemLoader(path.join(p.path, 'templates'))
            for k, p in layers.items()})

        for k, p in layers.items():
            flask.register_blueprint(p.blueprint)

        exports = self.exports

        @flask.route('/')
        def index():
            return render_template('index.html')

        @flask.route('/app/call/<name>', methods=['POST'])
        def call(name):
            payload = request.get_json()
            func = exports[name]
            return jsonify(func(payload))

        return flask
