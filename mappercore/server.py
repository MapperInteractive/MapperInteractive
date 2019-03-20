import inspect
import jinja2
import traceback

from os import path
from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_httpauth import HTTPBasicAuth

from .helpers.func import run_mapper


PERMITTED_ROUTE_PREFIXES = ['core', 'app']
PERMITTED_STATIC_FOLDERS = ['modules', 'stylesheets', 'vendors', 'images', 'javascripts', 'files']


class Server:

    def __init__(self, title, app_root_path=None, users=None):
        self.title = title
        self.core_root_path = path.join(path.dirname(__file__), 'static')

        if not app_root_path:
            self.app_root_path = self._auto_find_root_path()
        else:
            self.app_root_path = path.abspath(app_root_path)

        self.functions = {}
        self.users = users
        self.flask = self._make_flask_instance()

        # Add kmapper as a default setup
        self.register_function('run_mapper', run_mapper)


    def __call__(self, *args, **kwargs):
        return self.flask(*args, **kwargs)

    def register_function(self, name, func):
        self.functions[name] = func

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
        if self.users is not None:
            auth = HTTPBasicAuth()
            users = self.users

            @auth.get_password
            def get_pw(username):
                if username in users:
                    return users.get(username)
                return None

            return auth

        return None

    def _config_templates(self, flask):
        flask.jinja_loader = jinja2.PrefixLoader({
            'core': jinja2.FileSystemLoader(path.join(self.core_root_path, 'templates')),
            'app': jinja2.FileSystemLoader(path.join(self.app_root_path, 'templates'))
        })

    def _config_routes(self, flask, auth):
        route_index = self._route_index
        route_static = self._route_static_files
        route_call = self._route_function_call

        if auth is not None:
            route_index = auth.login_required(route_index)
            route_static = auth.login_required(route_static)

        flask.route("/")(route_index)
        flask.route("/app/call/<string:name>", methods=["POST"])(route_call)
        flask.route("/<string:group>/<path:file_path>")(route_static)

    def _route_static_files(self, group, file_path):
        if group in PERMITTED_ROUTE_PREFIXES:
            folder = file_path.split("/", 1)[0]

            if folder in PERMITTED_STATIC_FOLDERS:

                if group == 'app':
                    root_path = self.app_root_path
                else:
                    root_path = self.core_root_path

                directory = path.join(root_path, path.dirname(file_path))
                filename = path.basename(file_path)
                return send_from_directory(directory, filename)

        return self._response_forbidden()

    def _route_function_call(self, name):
        if name in self.functions:
            kwargs = request.json
            try:
                if kwargs:
                    result = self.functions[name](**kwargs)
                else:
                    result = self.functions[name]()

                status = 200
            except Exception as e:
                traceback.print_exc()
                result = { "error": "function call failed: " + str(e)}
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
        return render_template('core/index.html', title=self.title)
