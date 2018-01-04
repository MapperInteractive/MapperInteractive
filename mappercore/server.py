from flask import Flask


class Server:
    def __init__(self, name=None):
        super().__init__()

        if name is None:
            name = __name__

        self.server = Flask(name)
