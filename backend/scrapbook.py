from datetime import datetime
from bson import ObjectId
from db import scrapbook_collection, trips_collection, users_collection
from trips import get_trip_by_id

def create_scrapbook_entry(trip_id, image_url, caption, user_id):
    entry = {
        "trip_id": trip_id,
        "image_url": image_url,
        "caption": caption,
        "uploaded_by": user_id,
        "created_at": datetime.utcnow()
    }
    result = scrapbook_collection.insert_one(entry)
    return str(result.inserted_id)

def get_scrapbook_entries(trip_id):
    entries = scrapbook_collection.find({"trip_id": trip_id}).sort("created_at", -1)
    return [{
        "id": str(entry["_id"]),
        "tripId": entry["trip_id"],
        "imageUrl": entry["image_url"],
        "caption": entry["caption"],
        "uploadedBy": users_collection.find_one({"_id": ObjectId(entry["uploaded_by"])})["name"],
        "createdAt": entry["created_at"]
    } for entry in entries]

def can_access_scrapbook(trip_id, user_id):
    trip = get_trip_by_id(trip_id)
    if not trip:
        return False
    return str(trip["owner_id"]) == user_id or user_id in trip.get("collaborators", [])
