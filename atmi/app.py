from os import environ, path

from flask import Flask, render_template, send_from_directory, request, Response
from flask_webpack import Webpack

from atmi_backend.services.InitialService import InitialService

here = path.abspath(path.dirname(__file__))


def create_app():
    # __version__ = pkg_resources.require("atmi")[0].version

    flask_app = Flask(__name__)
    flask_app.debug = (('FLASK_ENV' in environ) and (environ['FLASK_ENV'] == 'development'))
    webpack = Webpack()
    # flask_app.config.from_object(config)
    flask_app.config["WEBPACK_MANIFEST_PATH"] = path.join(here, "manifest.json")
    webpack.init_app(flask_app)
    return flask_app


app = create_app()


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/initialize', methods=['GET'])
def init():
    ini_service = InitialService()
    has_record = ini_service.has_records()

    if not has_record:
        return render_template("setup.html")
    else:
        return render_template("login.html")


@app.route('/users/', methods=['POST'])
def registry_user():
    user = request.json['userName']
    email = request.json['userEmail']
    pwd = request.json['userPwd']
    return Response("{status: 'success'}", status=201, mimetype='application/json')


@app.route("/assets/<path:filename>")
def send_asset(filename):
    return send_from_directory(path.join(here, "public"), filename)


@app.errorhandler(500)
def internal_error(exception):
    app.logger.error(exception)
    return render_template('500.html'), 500


'''
export FLASK_APP=app.py
flask run
'''
if __name__ == "__main__":
    app.run(extra_files=[app.config["WEBPACK_MANIFEST_PATH"]])
