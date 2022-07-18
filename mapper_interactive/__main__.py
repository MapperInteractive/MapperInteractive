import commands


def main():
    parser = commands.parser()
    opt = parser.parse_args()
    commands.run(opt)


if __name__ == "__main__":
    main()
