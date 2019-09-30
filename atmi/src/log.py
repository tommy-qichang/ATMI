import logging
import os.path as path
from logging.handlers import RotatingFileHandler
import atmi.src.config as config
from atmi.app import app

app.config.from_object(config)
# initialize the log handler
logHandler = RotatingFileHandler(path.join(app.config["LOG_PATH"], app.config['LOG_FILENAME']), maxBytes=app.config['LOG_MAXBYTES'], backupCount=app.config['LOG_BACKUPS'])
# set the log handler level
logHandler.setLevel(app.config["DEBUG_LEVEL"])
# set the app logger level
app.logger.setLevel(app.config["DEBUG_LEVEL"])
app.logger.addHandler(logHandler)
