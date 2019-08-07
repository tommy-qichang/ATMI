from flask import Flask
from math import fabs, ceil


app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello World!"


def math_fabs(x):
    return fabs(x)


def math_ceil(x):
    return ceil(x)


if __name__ == "__main__":
    app.run()
