import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL")

try:
    client = MongoClient(MONGO_URI)
    db = client["sample_airbnb"]
    listings_collection = db["listingsAndReviews"]
    
    doc_count = listings_collection.count_documents({})
    print(f"✅ Connected to MongoDB! Found {doc_count} listings")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")

def get_all_listings():
    try:
        listings = list(listings_collection.find(
            {},
            {
                "_id": 1,
                "name": 1,
                "summary": 1,
                "property_type": 1,
                "price": 1,
                "images.picture_url": 1
            }
        ).limit(20))
        
        for listing in listings:
            listing["_id"] = str(listing["_id"])
            if "price" in listing:
                listing["price"] = float(str(listing["price"]))
            
        return listings, None
    except Exception as e:
        return None, str(e)
