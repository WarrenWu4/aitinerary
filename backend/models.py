from bson import ObjectId
from db import users_collection, trips_collection, days_collection, activities_collection
from flask import jsonify

def to_json(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def get_user_trips(user_id):
    try:
        trips = list(trips_collection.find({"owner_id": user_id}))
        # Convert ObjectId to string for JSON serialization
        for trip in trips:
            trip["_id"] = str(trip["_id"])
        return jsonify({"trips": trips}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_user(data):
    try:
        user = {
            "oauth_id": data["oauth_id"],
            "name": data["name"],
            "email": data["email"],
            "profile_pic": data["profile_pic"]
        }
        result = users_collection.insert_one(user)
        return jsonify({"message": "User created!", "user_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_trip(data):
    try:
        trip = {
            "title": data["title"],
            "destination": data["destination"],
            "start_date": data["start_date"],
            "end_date": data["end_date"],
            "owner_id": data["owner_id"]
        }
        result = trips_collection.insert_one(trip)
        return jsonify({"message": "Trip created!", "trip_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_day(trip_id, data):
    try:
        day = {
            "trip_id": trip_id,
            "date": data["date"],
        }
        result = days_collection.insert_one(day)
        return jsonify({"message": "Day added!", "day_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_activity(day_id, data):
    try:
        activity = {
            "day_id": day_id,
            "title": data["title"],
            "location": data["location"],
            "time": data["time"],
            "duration": data["duration"],
            "reservation_link": data["reservation_link"],
            "added_by": data["added_by"]
        }
        result = activities_collection.insert_one(activity)
        return jsonify({"message": "Activity added!", "activity_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
