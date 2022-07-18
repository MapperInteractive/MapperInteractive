import argparse

from . import cli, serve

__commands = {
    "cli": cli,
    "serve": serve,
}


def parser():
    parser = argparse.ArgumentParser("Mapper Interactive")

    parsers = parser.add_subparsers(
        title="command", dest="__command", required=True, metavar="command"
    )

    for name, module in __commands.items():
        subparser = parsers.add_parser(name, help=f"{name} --help")
        module.add_arguments(subparser)

    return parser


def run(opt):
    __commands[opt.__command].run(opt)
