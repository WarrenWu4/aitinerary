from bson import ObjectId
from db import trips_collection

def get_trip_by_id(trip_id):
    try:
        trip = trips_collection.find_one({"_id": ObjectId(trip_id)})
        return trip
    except:
        return None 