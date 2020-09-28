import logging
import os
import sys

from flask import Flask
from flask_cors import CORS
from gevent.pywsgi import WSGIServer
from gridfs import GridFS
from mongoengine import connect
from oauthlib.oauth2 import WebApplicationClient
from pymongo import MongoClient
from termcolor import colored

from mtv import g
from mtv.db import utils as DBUtils
from mtv.routes import add_routes
from mtv.utils import import_object

LOGGER = logging.getLogger(__name__)


class MTV:

    def __init__(self, cf, docker):
        self._cf = cf.copy()

        if not docker:
            self._db = connect(db=cf['db'], host=cf['host'], port=cf['port'],
                               username=cf['username'], password=cf['password'])
        else:
            self._db = connect(db=cf['dk_db'], host=cf['dk_host'], port=cf['dk_port'],
                               username=cf['dk_username'], password=cf['dk_password'])

    def _init_flask_app(self, env):
        app = Flask(
            __name__,
            static_url_path='',
            static_folder='../client/build',
            template_folder='../client/build'
        )

        app.config.from_mapping(**self._cf)

        if env == 'production':
            app.config.from_mapping(DEBUG=False, TESTING=False)

        elif env == 'development':
            app.config.from_mapping(DEBUG=True, TESTING=True)

        elif env == 'test':
            app.config.from_mapping(DEBUG=False, TESTING=True)

        CORS(app)
        add_routes(app)

        g['config'] = self._cf
        g['app'] = app
        g['client'] = WebApplicationClient(self._cf['GOOGLE_CLIENT_ID'])
        return app

    def update_db(self):

        # TODO: to be removed later
        self._db.drop_database(self._cf['db'])

        # copy from orion
        DBUtils.copy_from_partial(
            cols=['comment', 'datarun', 'dataset', 'event',
                  'experiment', 'pipeline', 'signal', 'signalrun', 'template'],
            fromdb=self._cf['or_db'],
            todb=self._cf['db'],
            fromhost=self._cf['or_host'],
            fromport=self._cf['or_port'],
            tohost=self._cf['host'],
            toport=self._cf['port'],
            exp_filter=self._cf['experiment_list']
        )

        # update collection "prediction" and "raw"
        orion_db_client = MongoClient(self._cf['or_host'], port=self._cf['or_port'])
        DBUtils.update_db(GridFS(orion_db_client[self._cf['or_db']]),
                          exp_filter=self._cf['experiment_list'])

    def run_server(self, env, port):

        env = self._cf['ENV'] if env is None else env
        port = self._cf['server_port'] if port is None else port

        # env validation
        if env not in ['development', 'production', 'test']:
            LOGGER.exception("env '%s' is not in "
                             "['development', 'production', 'test']", env)
            raise ValueError

        # just in case running app with the absolute path
        sys.path.append(os.path.dirname(__file__))

        app = self._init_flask_app(env)

        LOGGER.info(colored('Starting up FLASK APP in {} mode'.format(env),
                            'yellow'))

        LOGGER.info(colored('APIs are available on:', 'yellow')
                    + '  http://localhost:' + colored(port, 'green') + '/')

        if env == 'development':
            app.run(debug=True, port=port)
            # app.run(debug=True, port=port, ssl_context="adhoc")

        elif env == 'production':
            server = WSGIServer(('0.0.0.0', port), app, log=None)
            # server = WSGIServer(('0.0.0.0', port), app, ssl_context="adhoc", log=None)
            server.serve_forever()

    def run_module(self, module, args):
        try:
            func_object = module + '.main'
            func = import_object(func_object)
            func(*args)
        except Exception as e:
            LOGGER.exception("Error running the module '{}': {}"
                             .format(module, str(e)))
