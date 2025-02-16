import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL")

try:
    client = MongoClient(MONGO_URI)
    db = client["travelapp"]
    users_collection = db["users"]
    trips_collection = db["trips"]
    days_collection = db["days"]
    activities_collection = db["activities"]
    scrapbook_collection = db["scrapbook"]

    print("✅ Connected to MongoDB!")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
