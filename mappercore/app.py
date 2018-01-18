class App:

    def __init__(self, name, version=0):
        super().__init__()

        self.name = name
        self.version = version
        self.handlers = {}

    def callback(self, func):
        self.handlers[func.__name__] = func

    def trigger(self, func, workload):
        return self.handlers[func](workload)
