#!flask/bin/python
from .app import app

app.run(host="127.0.0.1", port=8080, debug=True)
