from os import path, getcwd
from flask import Flask, request, jsonify, render_template, send_from_directory
import jinja2


class Server:
    def __init__(self, name=None, cwd=None):
        super().__init__()

        if name is None:
            self.name = __name__

        if cwd is None:
            self.cwd = getcwd()

        self.flask = Flask(self.name, static_url_path='/_/static')
        self.init_template_loader()

    def serve(self, app):
        @self.flask.route('/{0}/'.format(app.name))
        def app_index():
            return render_template('index.html', app=app)

        @self.flask.route('/{0}/callbacks/<string:name>'.format(app.name), methods=['POST'])
        def app_call(name):
            return jsonify(app.trigger(name, request.json))

        @self.flask.route('/{0}/static/<path:filename>'.format(app.name))
        def app_static(filename):
            return send_from_directory(path.join(self.cwd, 'static'), filename)

        @self.flask.route('/{0}/scripts/<path:filename>'.format(app.name))
        def app_scripts(filename):
            return send_from_directory(path.join(self.cwd, 'scripts'), filename)

        @self.flask.route('/_/scripts/<path:filename>')
        def root_scripts(filename):
            return send_from_directory(path.join(self.flask.root_path, 'scripts'), filename)

    def init_template_loader(self):
        loader = jinja2.ChoiceLoader([
            self.flask.jinja_loader,
            jinja2.FileSystemLoader(path.join(self.cwd, 'templates')),
        ])
        self.flask.jinja_loader = loader

    def run(self):
        self.flask.run()
