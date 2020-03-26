from os import environ, path
from atmi_backend.log import setup_log
from flask import Flask
from flask_webpack import Webpack

from atmi_backend.route_map import setup_route_map

here = path.abspath(path.dirname(__file__))


def create_app():
    # __version__ = pkg_resources.require("atmi")[0].version

    flask_app = Flask(__name__)
    flask_app.debug = (('FLASK_ENV' in environ) and (environ['FLASK_ENV'] == 'development'))
    webpack = Webpack()
    # flask_app.config.from_object(config)
    flask_app.config["WEBPACK_MANIFEST_PATH"] = path.join(here, "manifest.json")
    webpack.init_app(flask_app)
    setup_route_map(flask_app, here)
    setup_log(flask_app)
    flask_app.url_map.strict_slashes = False
    return flask_app


app = create_app()

'''
export FLASK_APP=app.py
flask run
'''
if __name__ == "__main__":
    # app.run(extra_files=[app.config["WEBPACK_MANIFEST_PATH"]], debug=True)
    app.run(host='0.0.0.0', port=80, extra_files=[app.config["WEBPACK_MANIFEST_PATH"]])
