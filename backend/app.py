from dotenv import find_dotenv, load_dotenv
from flask import Flask, request, jsonify

import auth
from db import db
from models import create_user, create_trip, create_day, create_activity, get_user_trips
from bson import ObjectId

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)


@app.route("/")
def index():
    return jsonify({"message": "Flask server is running"}), 200

# auth routes
@app.route("/callback", methods=["GET", "POST"])
def callback():
    return auth.callback()


@app.route("/login")
def login():
    return auth.login()


@app.route("/logout")
def logout():
    return auth.logout()

# user routes
@app.route("/users/<user_id>/trips", methods=["GET"])
def user_trips(user_id):
    return get_user_trips(user_id)


@app.route("/users", methods=["POST"])
def add_user():
    return create_user(request.json)


@app.route("/trips", methods=["POST"])
def add_trip():
    return create_trip(request.json)


@app.route("/trips/<trip_id>/days", methods=["POST"])
def add_day(trip_id):
    return create_day(trip_id, request.json)


@app.route("/days/<day_id>/activities", methods=["POST"])
def add_activity(day_id):
    return create_activity(day_id, request.json)


if __name__ == "__main__":
    app.run()
