from mappercore.project import Project
from os import path
from flask import Flask, render_template
import jinja2


class Server:
    def __init__(self):
        super().__init__()
        self._projects = dict()

        self.register(Project('base', path=path.join(path.dirname(__file__), 'projects', 'base')))

    def register(self, project):
        assert project.name not in self._projects.keys()
        self._projects[project.name] = project

    def run(self):
        flask = Flask(__name__, static_folder=None, template_folder=None)
        flask.jinja_loader = jinja2.PrefixLoader({
            k: jinja2.FileSystemLoader(path.join(p.path, 'templates'))
            for k, p in self._projects.items()})

        for k, p in self._projects.items():
            flask.register_blueprint(p.blueprint)

        @flask.route('/')
        def index():
            return render_template('base/welcome.html')

        flask.run(host='0.0.0.0')
