import pyairbnb
from opencage.geocoder import OpenCageGeocode
from dotenv import find_dotenv, load_dotenv
from os import environ as env
import json

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

def get_coordinates(city_name, api_key):
    geocoder = OpenCageGeocode(api_key)
    result = geocoder.geocode(city_name)
    
    if result:
        return result[0]['geometry']['lat'], result[0]['geometry']['lng']
    else:
        return None

city = "College Station"
api_key = env.get("GEOCODE_KEY") # Replace with your OpenCage API key
coord_lat, coord_long = get_coordinates(city, api_key)

assert((coord_lat, coord_long))

low_coord_lat = coord_lat - .07
high_coord_lat = coord_lat + .07

low_coord_long = coord_long - .07
high_coord_long = coord_long + .07

# Define search parameters
currency = "USD"  # Currency for the search
check_in = "2025-02-16"  # Check-in date
check_out = "2025-02-17"  # Check-out date
zoom_value = 2  # Zoom level for the map

# Search listings within specified coordinates and date range
search_results = pyairbnb.search_all(check_in, check_out, high_coord_lat, high_coord_long, low_coord_lat, low_coord_long, zoom_value, currency, "")

# Save the search results as a JSON file
with open('search_results.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(search_results))  # Convert results to JSON and write to file






