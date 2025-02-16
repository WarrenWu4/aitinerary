from dotenv import find_dotenv, load_dotenv
from flask import Flask, request, jsonify
import os
import auth
from db import db, trips_collection, days_collection, activities_collection
from models import (
    create_user, create_trip, create_day, create_activity, 
    get_user_trips, get_user_by_oauth_id, to_json
)
from bson import ObjectId
from auth import requires_auth, get_current_user, get_user_data

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("APP_SECRET_KEY not set or empty")

@app.route("/")
def index():
    current_user = get_user_data()
    return jsonify({
        "message": "Flask server is running",
        "authenticated": current_user is not None,
        "user": current_user
    }), 200

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
    try:
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        
        if not trip:
            return jsonify({"error": "Trip not found"}), 404
            
        if trip['owner_id'] != str(user['_id']):
            return jsonify({"error": "Unauthorized"}), 403
            
        return create_day(trip_id, request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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


@app.route("/test/create")
@requires_auth
def create_test_data():
    try:
        # Get current user
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        user_id = str(user['_id'])

        # Create a trip
        trip_data = {
            "title": "Test Trip to Paris",
            "destination": "Paris, France",
            "start_date": "2024-06-01",
            "end_date": "2024-06-07",
            "owner_id": user_id
        }
        trip_response, status_code = create_trip(trip_data)
        if status_code != 201:
            return trip_response, status_code
        trip_id = trip_response.json['trip_id']

        # Create a day
        day_data = {
            "date": "2024-06-01"
        }
        day_response, status_code = create_day(trip_id, day_data)
        if status_code != 201:
            return day_response, status_code
        day_id = day_response.json['day_id']

        # Create an activity
        activity_data = {
            "title": "Visit Eiffel Tower",
            "location": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris",
            "time": "10:00",
            "duration": "2 hours",
            "reservation_link": "https://www.toureiffel.paris/",
            "added_by": user_id
        }
        activity_response, status_code = create_activity(day_id, activity_data)
        if status_code != 201:
            return activity_response, status_code
        activity_id = activity_response.json['activity_id']

        # Fetch and return the complete data
        trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        day = days_collection.find_one({"_id": ObjectId(day_id)})
        activity = activities_collection.find_one({"_id": ObjectId(activity_id)})

        # Convert ObjectIds to strings for JSON serialization
        complete_data = {
            "trip": to_json(trip),
            "day": to_json(day),
            "activity": to_json(activity)
        }

        return jsonify({
            "message": "Test data created successfully!",
            "data": complete_data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='localhost', port=3000)
