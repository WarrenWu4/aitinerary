import os
from flask import Flask, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL")

app = Flask(__name__)

try:
    client = MongoClient(MONGO_URI)
    # change shit here
    db = client["sample_airbnb"]
    listings_collection = db["listingsAndReviews"]
    
    doc_count = listings_collection.count_documents({})
    print(f"✅ Connected to MongoDB! Found {doc_count} listings")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")

@app.route("/")
def home():
    return jsonify({"message": "Flask server is running!"})

@app.route("/listings")
def get_listings():
    """Fetch and return listings from the database."""
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
            
        return jsonify({"listings": listings}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
