from os import path
from flask import render_template, send_from_directory


class Router:

    def __init__(self, project):
        self.project = project

    def index(self):
        return render_template('%s/index.html' % self.project.name, project=self.project)

    def modules(self, filename):
        return self._static('modules', filename)

    def files(self, filename):
        return self._static('files', filename)

    def styles(self, filename):
        return self._static('styles', filename)

    def vendors(self, filename):
        return self._static('vendors', filename)

    def _static(self, folder, filename):
        return send_from_directory(path.join(self.project.path, folder), filename)
