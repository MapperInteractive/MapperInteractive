import inspect
import jinja2
import traceback
import json

from os import path
from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_httpauth import HTTPBasicAuth

PERMITTED_ROUTE_PREFIXES = ['core', 'app']
PERMITTED_STATIC_FOLDERS = ['modules', 'stylesheets', 'vendors', 'images', 'javascripts', 'files']


class Server:
    def __init__(self, title, users=None, functions=None, conf=None):
        self.title = title

        # setup paths
        self._core_root_path = path.join(path.dirname(__file__), 'static')
        self._app_root_path = self._auto_find_root_path()

        # read app config
        self._load_config_json()
        self._should_load_config_js = self._config_js_exists()

        self._conf = conf
        self._config_js = None

        if self._config_js_exists():
            self._config_js = 'modules/config'

        self._user_config = None

        self._users = users
        self._functions = {} if functions is None else functions

        self._flask = self._make_flask_instance()

        if self._conf:
            if getattr(self._conf, 'configure', None) is None:
                raise RuntimeError("Your conf object should respond to method 'configure'")

            self._conf.configure(self)

    def __repr__(self):
        return 'Server(title="{}", app_root_path="{}", core_root_path="{}", users={})' \
            .format(self.title, self._app_root_path, self._core_root_path, self._users)

    def __call__(self, *args, **kwargs):
        return self._flask(*args, **kwargs)

    def register_function(self, name, func):
        self._functions[name] = func

    def set_config_js(self, module):
        self._config_js = module

    def set_user_specs(self, spec_file):
        with open(spec_file) as json_file:
            user_config = json.load(json_file)

        self._user_config = user_config

    @property
    def flask(self):
        return self._flask

    @staticmethod
    def _auto_find_root_path():
        """
        your_script.py (2) => server.py (1) => _find_root_path
        """
        frame = inspect.stack()[2]
        module = inspect.getmodule(frame[0])
        return path.dirname(path.abspath(module.__file__))

    def _make_flask_instance(self):

        # create required instances: flask, auth
        flask = Flask(__name__, static_folder=None)
        auth = self._get_auth()

        self._config_templates(flask)
        self._config_routes(flask, auth)

        return flask

    def _get_auth(self):
        if self._users is not None:
            auth = HTTPBasicAuth()
            users = self._users

            @auth.get_password
            def get_pw(username):
                if username in users:
                    return users.get(username)
                return None

            return auth

        return None

    def _config_templates(self, flask):
        flask.jinja_loader = jinja2.PrefixLoader({
            'core': jinja2.FileSystemLoader(path.join(self._core_root_path, 'templates')),
            'app': jinja2.FileSystemLoader(path.join(self._app_root_path, 'templates'))
        })

    def _config_routes(self, flask, auth):
        route_index = self._route_index
        route_static = self._route_static_files
        route_call = self._route_function_call

        if auth is not None:
            route_index = auth.login_required(route_index)
            route_static = auth.login_required(route_static)
            route_call = auth.login_required(route_call)

        flask.route("/")(route_index)
        flask.route("/app/call/<string:name>", methods=["POST"])(route_call)
        flask.route("/<string:group>/<path:file_path>")(route_static)

    def _route_static_files(self, group, file_path):
        if group in PERMITTED_ROUTE_PREFIXES:
            folder = file_path.split("/", 1)[0]

            if folder in PERMITTED_STATIC_FOLDERS:

                if group == 'app':
                    root_path = self._app_root_path
                else:
                    root_path = self._core_root_path

                directory = path.join(root_path, path.dirname(file_path))
                filename = path.basename(file_path)
                return send_from_directory(directory, filename)

        return self._response_forbidden()

    def _route_function_call(self, name):
        if name in self._functions:
            kwargs = request.json
            try:
                if kwargs:
                    result = self._functions[name](**kwargs)
                else:
                    result = self._functions[name]()

                status = 200
            except Exception as e:
                traceback.print_exc()
                result = {"error": "function call failed: " + str(e)}
                status = 500
            return jsonify(result), status
        return jsonify({
            "error": "function {} is not found.".format(name)
        }), 500

    @staticmethod
    def _response_forbidden():
        response = jsonify({'message': 'Forbidden'})
        return response, 403

    def _route_index(self):
        return render_template('core/index.html',
                               title=self.title,
                               config_js=self._config_js,
                               user_config=self._user_config)

    def _load_config_json(self):
        json_file_path = path.join(self._app_root_path, 'config.json')
        if path.isfile(json_file_path):
            with open(json_file_path) as f:
                return json.load(f)

        return {}

    def _config_js_exists(self):
        config_js = path.join(self._app_root_path, 'modules', 'config.js')
        return path.isfile(config_js)
