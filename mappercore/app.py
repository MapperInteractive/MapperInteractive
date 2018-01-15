class App:

    def __init__(self, name):
        super().__init__()

        self.name = name
        self.handlers = {}

    def callback(self, func):
        self.handlers[func.__name__] = func

    def trigger(self, func, workload):
        return self.handlers[func](workload)
