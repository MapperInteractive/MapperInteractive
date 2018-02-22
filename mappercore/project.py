from os.path import abspath, join
from mappercore.router import Router
from flask import Blueprint


class Project:

    def __init__(self, name, path, version=0):
        super().__init__()

        self.name = name
        self.path = abspath(path)
        self.version = version
        self.events = {}
        self.router = Router(self)
        self.blueprint = Blueprint(
            self.name, __name__,
            url_prefix='/{0}'.format(self.name),
            template_folder='templates',
            static_folder=None)

        self.blueprint.route('/')(self.router.index)
        self.blueprint.route('/scripts/<path:filename>')(self.router.scripts)
        self.blueprint.route('/files/<path:filename>')(self.router.files)
        self.blueprint.route('/callback/<path:filename>')(self.router.callback)
        self.blueprint.route('/styles/<path:filename>')(self.router.styles)
        self.blueprint.route('/vendors/<path:filename>')(self.router.vendors)

    def on(self, func):
        self.events[func.__name__] = func

    def trigger(self, func, workload):
        return self.events[func](workload)
