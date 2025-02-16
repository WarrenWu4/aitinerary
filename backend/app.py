from dotenv import find_dotenv, load_dotenv
from flask import Flask, request, jsonify
import os
import auth
from db import db
from models import create_user, create_trip, create_day, create_activity, get_user_trips, get_user_by_oauth_id
from bson import ObjectId
from auth import requires_auth, get_current_user

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("APP_SECRET_KEY not set or empty")

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
@requires_auth
def user_trips(user_id):
    current_user = get_current_user()
    user = get_user_by_oauth_id(current_user['userinfo']['sub'])
    
    # Only allow users to view their own trips
    if str(user['_id']) != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    return get_user_trips(user_id)


@app.route("/users", methods=["POST"])
def add_user():
    return create_user(request.json)


@app.route("/trips", methods=["POST"])
@requires_auth
def add_trip():
    current_user = get_current_user()
    user = get_user_by_oauth_id(current_user['userinfo']['sub'])
    
    # Add the user's ID to the trip data
    trip_data = request.json
    trip_data['owner_id'] = str(user['_id'])
    
    return create_trip(trip_data)


@app.route("/trips/<trip_id>/days", methods=["POST"])
@requires_auth
def add_day(trip_id):
    # Verify trip belongs to user
    current_user = get_current_user()
    user = get_user_by_oauth_id(current_user['userinfo']['sub'])
    trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
    
    if not trip or trip['owner_id'] != str(user['_id']):
        return jsonify({"error": "Unauthorized"}), 403
        
    return create_day(trip_id, request.json)


@app.route("/days/<day_id>/activities", methods=["POST"])
@requires_auth
def add_activity(day_id):
    # Verify day belongs to user's trip
    current_user = get_current_user()
    user = get_user_by_oauth_id(current_user['userinfo']['sub'])
    day = days_collection.find_one({"_id": ObjectId(day_id)})
    
    if not day:
        return jsonify({"error": "Day not found"}), 404
        
    trip = trips_collection.find_one({"_id": ObjectId(day['trip_id'])})
    if not trip or trip['owner_id'] != str(user['_id']):
        return jsonify({"error": "Unauthorized"}), 403
    
    activity_data = request.json
    activity_data['added_by'] = str(user['_id'])
    
    return create_activity(day_id, activity_data)


if __name__ == "__main__":
    app.run(host='localhost', port=3000)
