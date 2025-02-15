from dotenv import find_dotenv, load_dotenv
from flask import Flask
from flask import jsonify

import auth
from db import get_all_listings

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)


@app.route("/listings")
def get_listings():
    listings, error = get_all_listings()

    if error:
        return jsonify({"error": error}), 500

    return jsonify({"listings": listings}), 200


@app.route("/callback", methods=["GET", "POST"])
def callback():
    return auth.callback()


@app.route("/login")
def login():
    return auth.login()


@app.route("/logout")
def logout():
    return auth.logout()


if __name__ == "__main__":
    app.run()
