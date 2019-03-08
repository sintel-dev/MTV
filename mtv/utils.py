import importlib
import logging
import os
import sys
import json
from bson import ObjectId


LOGGER = logging.getLogger(__name__)

class _JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

json_encoder = _JSONEncoder().encode

def _is_string(o):
    return isinstance(o, str)


def _is_list(o):
    return isinstance(o, list)

def import_object(object_name):
    """Import an object from its Fully Qualified Name."""
    package, name = object_name.rsplit('.', 1)
    return getattr(importlib.import_module(package), name)


def create_dirs(dirs):
    """Create directories if not exist.

    Args:
        dirs (str or str[]): Path(s) to the directorie(s).
    """

    if _is_string(dirs):
        if not os.path.isdir(dirs):
            os.mkdir(dirs)

    elif _is_list(dirs):
        for p in dirs:
            if not os.path.isdir(p):
                os.mkdir(p)

    else:
        LOGGER.exception('Error creating directories, argument "dirs" must be \
                         a string or a string list')
        raise


def get_dirs(dir):
    """Get the directory names under the specified directory."""

    return [name for name in os.listdir(dir)
            if os.path.isdir(os.path.join(dir, name))]


def get_files(dir, level=0):
    """Get all the files recursively under the specified directory"""
    if level == 0:
        result = []
        for (root, dirs, files) in os.walk(dir):
            result.extend(files)
        return result
    else:
        pass
        # TODO

def walk(document, transform):
    if not isinstance(document, dict):
        return document

    new_doc = dict()
    for key, value in document.items():
        if isinstance(value, dict):
            value = walk(value, transform)
        elif isinstance(value, list):
            value = [walk(v, transform) for v in value]

        new_key, new_value = transform(key, value)
        new_doc[new_key] = new_value

    return new_doc

def remove_dots(document):
    return walk(document, lambda key, value: (key.replace('.', '-'), value))

def restore_dots(document):
    return walk(document, lambda key, value: (key.replace('-', '.'), value))

def setup_logging(verbosity=1, logfile=None, logger_name=None):
    # if logger_name=None, return the root logger
    logger = logging.getLogger(logger_name)

    # Level     Numeric value
    # CRITICAL	50
    # ERROR	    40
    # WARNING	30
    # INFO	    20
    # DEBUG	    10
    # NOTSET	0
    # Logging messages which are less severe than level will be ignored
    log_level = (3 - verbosity) * 10

    fmt = '%(asctime)s - %(process)d - %(levelname)s - %(module)s - %(message)s'
    formatter = logging.Formatter(fmt)
    logger.setLevel(log_level)
    logger.propagate = False

    if logfile:
        file_handler = logging.FileHandler(logfile)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    else:
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)