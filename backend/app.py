from flask import Flask, jsonify
from db import get_all_listings

app = Flask(__name__)

@app.route("/listings")
def get_listings():
    listings, error = get_all_listings()
    
    if error:
        return jsonify({"error": error}), 500
        
    return jsonify({"listings": listings}), 200

if __name__ == "__main__":
    app.run()
