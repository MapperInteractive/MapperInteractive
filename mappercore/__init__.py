import inspect
from os import path

import jinja2
from flask import Flask, Blueprint, render_template, send_from_directory, jsonify, request

name = "mappercore"

__all__ = ['Server']


class Router:

    def __init__(self, project):
        self.project = project

    def index(self):
        return render_template('%s/index.html' % self.project.name, project=self.project)

    def modules(self, filename):
        return self._static('modules', filename)

    def files(self, filename):
        return self._static('files', filename)

    def styles(self, filename):
        return self._static('styles', filename)

    def vendors(self, filename):
        return self._static('vendors', filename)

    def _static(self, folder, filename):
        return send_from_directory(path.join(self.project.path, folder), filename)


class Layer:

    def __init__(self, name, root_path, version=0):
        self.name = name
        self.path = path.abspath(root_path)
        self.version = version
        self.events = {}
        self.router = Router(self)
        self.blueprint = Blueprint(
            self.name,
            __name__,
            url_prefix='/{0}'.format(self.name),
            template_folder='templates',
            static_folder=None,
            root_path=self.path)

        self.blueprint.route('/')(self.router.index)
        self.blueprint.route('/modules/<path:filename>')(self.router.modules)
        self.blueprint.route('/files/<path:filename>')(self.router.files)
        self.blueprint.route('/styles/<path:filename>')(self.router.styles)
        self.blueprint.route('/vendors/<path:filename>')(self.router.vendors)

    def on(self, func):
        self.events[func.__name__] = func


class Server:
    def __init__(self, root_path=None, host='0.0.0.0', port=5000):

        if not root_path:
            self.root_path = self._find_root_path()
        else:
            self.root_path = path.abspath(root_path)

        self.host = host
        self.port = port
        self.exports = {}

    def flask(self):
        flask = self.setup_flask()
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
        # flask.run(host=self.host, port=self.port)

    def register_function(self, name, func):
        self.exports[name] = func

    @staticmethod
    def _find_root_path():
        """
        your_script.py (2) => server.py (1) => _find_root_path
        """
        frame = inspect.stack()[2]
        module = inspect.getmodule(frame[0])
        return path.dirname(path.abspath(module.__file__))

    def setup_flask(self):
        flask = Flask(__name__, static_folder=None)
        layers = {
            'core': Layer('core', root_path=path.join(path.dirname(__file__), '..', 'visualization', 'dist')),
            'app': Layer('app', root_path=self.root_path),
        }

        flask.jinja_loader = jinja2.PrefixLoader({
            k: jinja2.FileSystemLoader(path.join(p.path, 'templates'))
            for k, p in layers.items()})

        for k, p in layers.items():
            flask.register_blueprint(p.blueprint)

        return flask
