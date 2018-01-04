class EventsMixin:
    def __init__(self):
        super().__init__()
        self.events = dict()

    def on(self, event):
        def call(func):
            self.add_listener(event, func)

        return call

    def trigger(self, event, workload):
        if not self.has_listener(event):
            return False

        for callback in self.events[event]:
            callback(workload)

    def add_listener(self, event, func):
        if event not in self.events:
            self.events[event] = list()

        self.events[event].append(func)

    def has_listener(self, event):
        if event not in self.events:
            return False

        return len(self.events[event]) > 0

    def get_events(self):
        return self.events.keys()

    def get_listeners(self, event):
        if self.has_listener(event):
            return self.events[event]

        return None
