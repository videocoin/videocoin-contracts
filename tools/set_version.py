#!/usr/bin/env python3
import argparse
from pathlib import Path


def main(value, path):
    print('supplying file {} with {} tag...'.format(path, value))
    pattern = 'version = "{}"'
    
    path = Path(path)
    text = path.read_text()
    text = text.replace(pattern.format('unset'), pattern.format(value))
    path.write_text(text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Seeks for *.sol files and sets version.')
    parser.add_argument('--value', type=str, default='', help='value which will be set')
    parser.add_argument('--path', type=str, default='', help='path to Versionable.sol')

    args = parser.parse_args()

    if len(args.value) == 0 or len(args.path) == 0:
        parser.print_usage()
        exit(1)

    main(args.value, args.path)