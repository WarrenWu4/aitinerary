from dotenv import find_dotenv, load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import auth
import retell_functions
from db import db, trips_collection, days_collection, activities_collection, users_collection
from models import (
    create_user, create_trip, create_day, create_activity, 
    get_user_trips, get_user_by_oauth_id, to_json, update_trip, delete_trip
)
from bson import ObjectId
from auth import requires_auth, get_current_user, get_user_data
from scrapbook import create_scrapbook_entry, get_scrapbook_entries, can_access_scrapbook
from storage import upload_file
from datetime import datetime
import requests
from google import genai

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, supports_credentials=True, origins=[os.getenv("FRONTEND_URL")])
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
        
    try:
        trips = list(trips_collection.find(
            {
                "$or": [
                    {"owner_id": user_id},
                    {"collaborators": user_id}
                ]
            },
            {
                "title": 1,
                "start_date": 1,
                "end_date": 1,
                "destination": 1,
                "collaborators": 1,
                "status": 1,
                "_id": 1
            }
        ))
        
        formatted_trips = []
        for trip in trips:
            formatted_trips.append({
                "tripid": str(trip["_id"]),
                "name": trip["title"],
                "start": trip["start_date"],
                "end": trip["end_date"],
                "destination": trip["destination"],
                "collaborators": trip.get("collaborators", []),
                "status": trip.get("status", "active")
            })
            
        return jsonify({"trips": formatted_trips}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

# test create 
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

@app.route("/api/user")
@requires_auth
def get_user():
    user_data = get_user_data()
    if user_data:
        return jsonify(user_data)
    return jsonify({"error": "User not found"}), 404

@app.route("/trips/<trip_id>", methods=["PATCH"])
@requires_auth
def edit_trip(trip_id):
    try:
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        # Find trip
        trip = trips_collection.find_one({"_id": trip_id})
        if not trip:
            return jsonify({"error": "Trip not found"}), 404
            
        # Check authorization
        if trip["owner_id"] != str(user['_id']) and str(user['_id']) not in trip.get("collaborators", []):
            return jsonify({"error": "Unauthorized"}), 403
            
        return update_trip(trip_id, request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trips/<trip_id>", methods=["DELETE"])
@requires_auth
def remove_trip(trip_id):
    try:
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        # Find trip
        trip = trips_collection.find_one({"_id": trip_id})
        if not trip:
            return jsonify({"error": "Trip not found"}), 404
            
        # Only owner can delete
        if trip["owner_id"] != str(user['_id']):
            return jsonify({"error": "Unauthorized"}), 403
            
        return delete_trip(trip_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/activity/create", methods=["POST"])
@requires_auth
def better_add_activity():
    try:
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        activity_data = request.json
        activity_data['owner_id'] = str(user['_id'])
        return create_activity(activity_data["activity_id"],activity_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# test trip 
@app.route("/test/trip", methods=["GET"])
@requires_auth
def test_trip_operations():
    try:
        # Get current user
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        user_id = str(user['_id'])

        # 1. Create a trip
        import uuid
        trip_id = str(uuid.uuid4())
        trip_data = {
            "trip_id": trip_id,
            "title": "Test Trip to Tokyo",
            "destination": "Tokyo, Japan",
            "start_date": "2024-07-01",
            "end_date": "2024-07-07",
            "owner_id": user_id
        }
        trip_response, status_code = create_trip(trip_data)
        if status_code != 201:
            return trip_response, status_code

        # 2. Update the trip
        update_data = {
            "title": "Updated Test Trip to Tokyo",
            "status": "planning"
        }
        update_response, status_code = update_trip(trip_id, update_data)
        if status_code != 200:
            return update_response, status_code

        # 3. Fetch the trip to verify changes
        trip = trips_collection.find_one({"_id": trip_id})
        if not trip:
            return jsonify({"error": "Failed to fetch updated trip"}), 500

        # 4. Delete the trip
        delete_response, status_code = delete_trip(trip_id)
        if status_code != 200:
            return delete_response, status_code

        # 5. Verify deletion
        deleted_trip = trips_collection.find_one({"_id": trip_id})
        deletion_verified = deleted_trip is None

        # Return test results
        return jsonify({
            "message": "Trip operations test completed successfully!",
            "steps": {
                "creation": trip_response.json,
                "update": update_response.json,
                "deletion": delete_response.json,
                "deletion_verified": deletion_verified
            },
            "trip_data": to_json(trip)  # This shows the trip data before deletion
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trip/<trip_id>/<uid>", methods=["GET"])
def get_trip(trip_id, uid):
    try:
        trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            return jsonify({"error": "Trip not found"}), 404
        return jsonify(to_json(trip)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trips/<trip_id>", methods=["PUT"])
@requires_auth
def update_existing_trip(trip_id):
    try:
        data = request.json
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        # Verify user owns or is a collaborator on this trip
        existing_trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        if not existing_trip or (str(existing_trip["owner_id"]) != str(user["_id"]) and 
                               str(user["_id"]) not in existing_trip.get("collaborators", [])):
            return jsonify({"error": "Unauthorized"}), 403
            
        # Update the trip
        trips_collection.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": {
                "title": data["title"],
                "destination": data["destination"],
                "start_date": data["start_date"],
                "end_date": data["end_date"],
                "collaborators": data["collaborators"],
                "activities": data["activities"],
                "lodging_id": data["lodging_id"],
                "travel_id": data["travel_id"],
                "status": data["status"]
            }}
        )
        
        return jsonify({"message": "Trip updated successfully", "trip_id": trip_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trips/<trip_id>/collaborators", methods=["POST"])
@requires_auth
def add_collaborator(trip_id):
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        # Get current user
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        # Find trip
        trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            return jsonify({"error": "Trip not found"}), 404
            
        # Check if current user is the owner
        if trip["owner_id"] != str(user['_id']):
            return jsonify({"error": "Only the trip owner can add collaborators"}), 403
            
        # Find user by email
        collaborator = users_collection.find_one({"email": email})
        if not collaborator:
            return jsonify({"error": "User not found"}), 404
            
        # Check if user is already a collaborator
        if str(collaborator['_id']) in trip.get("collaborators", []):
            return jsonify({"error": "User is already a collaborator"}), 400
            
        # Add collaborator
        trips_collection.update_one(
            {"_id": ObjectId(trip_id)},
            {"$addToSet": {"collaborators": str(collaborator['_id'])}}
        )
        
        return jsonify({
            "message": "Collaborator added successfully",
            "userId": str(collaborator['_id'])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/users/emails", methods=["POST"])
@requires_auth
def get_user_emails():
    try:
        data = request.json
        user_ids = data.get('userIds', [])
        
        if not user_ids:
            return jsonify({"emails": []}), 200
            
        # Convert string IDs to ObjectIds
        object_ids = [ObjectId(uid) for uid in user_ids]
        
        # Find users and get their emails
        users = users_collection.find(
            {"_id": {"$in": object_ids}},
            {"email": 1}
        )
        
        emails = [user['email'] for user in users]
        
        return jsonify({"emails": emails}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/activity/<activity_id>", methods=["GET"])
def get_activity(activity_id):
    try:
        activity = activities_collection.find_one({"activity_id": activity_id})
        if not activity:
            return jsonify({"error": "Activity not found"}), 404
        return jsonify(to_json(activity)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trips/<trip_id>/scrapbook", methods=["GET"])
@requires_auth
def get_trip_scrapbook(trip_id):
    try:
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        if not can_access_scrapbook(trip_id, str(user['_id'])):
            return jsonify({"error": "Unauthorized"}), 403
            
        entries = get_scrapbook_entries(trip_id)
        return jsonify({"entries": entries}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/trips/<trip_id>/scrapbook/upload", methods=["POST"])
@requires_auth
def upload_scrapbook_entry(trip_id):
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        current_user = get_current_user()
        user = get_user_by_oauth_id(current_user['userinfo']['sub'])
        
        if not can_access_scrapbook(trip_id, str(user['_id'])):
            return jsonify({"error": "Unauthorized"}), 403
            
        file = request.files['image']
        caption = request.form.get('caption', '')
        
        image_url = upload_file(file)
        if not image_url:
            return jsonify({"error": "Failed to upload image"}), 500
            
        entry_id = create_scrapbook_entry(
            trip_id=trip_id,
            image_url=image_url,
            caption=caption,
            user_id=str(user['_id'])
        )
        
        entry = {
            "id": entry_id,
            "tripId": trip_id,
            "imageUrl": image_url,
            "caption": caption,
            "uploadedBy": user['name'],
            "createdAt": datetime.utcnow().isoformat()
        }
        
        return jsonify({"message": "Entry created successfully", "entry": entry}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.route("/recommendation", methods=["POST"])
def get_recommendation():
    data = request.json
    # data = {"location": "New York City"}
    if not data:
        return jsonify({"error": "Location is required"}), 400
    location = data.get("location")
    prompt = f"""
    Recommend some activites to do in {location}. Structure your format in the following way:
    [{{
        title: "",
        description: "",
    }}]
    Do not attempt to pretty format the response. Also do not include any text other than the response. Do not format the response using new lines or line breaks or back slashes. Just one continuous string. Make sure that your response is in JSON format and can be parsed by the client.
    """

    response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
    )
    if (not response.text):
        return jsonify({"error": "No response from AI"}), 500
    text = response.text.replace("\\", " ")
    return jsonify({"msg": text}), 200

@app.route("/retell/inbound", methods=["POST"])
def retell_inbound():
    data = request.json
    print("data is", data)
    if not data:
        return jsonify({"error": "Data is required"}), 400

    number = data.get("to_number")

    return jsonify(retell_functions.inbound(number), 200)



if __name__ == "__main__":
    app.run(host='localhost', port=3000, debug=True)
