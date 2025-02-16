from bson import ObjectId
from db import users_collection, trips_collection, days_collection, activities_collection, activities_collection
from flask import jsonify
from datetime import datetime

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

def create_or_update_user(data):
    try:
        existing_user = users_collection.find_one({"oauth_id": data["oauth_id"]})
        if existing_user:
            users_collection.update_one(
                {"oauth_id": data["oauth_id"]},
                {"$set": data}
            )
            return jsonify({"message": "User updated!", "user_id": str(existing_user["_id"])}), 200
        else:
            result = users_collection.insert_one(data)
            return jsonify({"message": "User created!", "user_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_by_oauth_id(oauth_id):
    user = users_collection.find_one({"oauth_id": oauth_id})
    return to_json(user) if user else None

def create_trip(data):
    try:
        # removing this because need to overwrite existing trips anyways
        existing_trip = trips_collection.find_one({"_id": ObjectId(data["trip_id"])})
        if existing_trip:
            trips_collection.update_one(
                {"title": data["title"], "owner_id": data["owner_id"]},
                {"$set": data}
            )
            return jsonify({"message": "trip updated", "trip_id": data["trip_id"]}), 200 
        else:
            trip = {
                    "trip_id": data["trip_id"],  # Using frontend-provided UUID
                    "title": data["title"],
                    "destination": data["destination"],
                    "start_date": data["start_date"],
                    "end_date": data["end_date"],
                    "owner_id": data["owner_id"],
                    "collaborators": [],
                    "created_at": datetime.utcnow(),
                    "activities": [],
                    "lodging_id": None,
                    "travel_id": None,
                    "status": "active"
                    }
            result = trips_collection.insert_one(trip)
            return jsonify({"message": "Trip created!", "trip_id": data["trip_id"]}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def update_trip(trip_id, data):
    try:
        update_data = {k: v for k, v in data.items() 
                      if k in ["title", "destination", "start_date", "end_date", "status"]}
        result = trips_collection.update_one(
            {"_id": trip_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Trip not found"}), 404
        return jsonify({"message": "Trip updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def delete_trip(trip_id):
    try:
        result = trips_collection.delete_one({"_id": trip_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Trip not found"}), 404
        return jsonify({"message": "Trip deleted successfully!"}), 200
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

def create_activity(activity_id, data):
    try:
        activity = {
            "activity_id": activity_id,
            "icon": data["icon"],
            "color": data["color"],
            "title": data["title"],
            "description": data["description"],
            "start_time": data["start_time"],
            "end_time": data["end_time"],
            "people": data["people"],
        }
        result = activities_collection.insert_one(activity)
        return jsonify({"message": "Activity added!", "activity_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
