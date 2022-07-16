import argparse
import webbrowser
from threading import Timer

from .app import app

parser = argparse.ArgumentParser("Run a Mapper Interactive server")

parser.add_argument(
    "-H",
    "--host",
    default="127.0.0.1",
    help="The host name to serve Mapper Interactive on",
    type=str,
)
parser.add_argument(
    "-p",
    "--port",
    default=5000,
    help="The port number to serve Mapper Interactive on",
    type=int,
)
parser.add_argument(
    "-d", "--debug", action="store_true", help="Launch the server in debug mode"
)

parser.add_argument("--headless", action="store_true", help="Don't launch a browser")

opt = parser.parse_args()


def open_browser():
    url = f"http://{opt.host}:{opt.port}"
    webbrowser.open(url)


if not opt.headless:
    Timer(0.125, open_browser).start()

app.run(host=opt.host, port=opt.port, debug=opt.debug)
