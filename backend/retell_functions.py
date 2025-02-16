import json
from os import environ as env
from urllib.parse import quote_plus, urlencode
from functools import wraps
from flask import Flask, redirect, render_template, session, url_for, jsonify
import os
from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for
from models import get_user_by_oauth_id, get_oauth_id_by_email

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")
print(app.secret_key)

retell_key = os.getenv("RETELL_KEY")

from retell import Retell

# retell_client = Retell(
#     api_key="YOUR_API_KEY"
# )

def inbound(number):
    print("number is", number)

    if number.startswith("+1"):
        number = number[2:]

    if number.startswith("832"):
        return {"name": "Andrew"}
    elif number.startswith("512"):
        return {"name": "Warren", "email": "weiwu@tamu.edu", "oauth_id": get_oauth_id_by_email("weiwu@tamu.edu")}
    else:
        return {"name": ""}