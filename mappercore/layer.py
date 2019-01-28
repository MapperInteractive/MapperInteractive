from os import path
from flask import Blueprint

from .router import Router


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
