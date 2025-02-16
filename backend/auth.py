import json
from os import environ as env
from urllib.parse import quote_plus, urlencode
from functools import wraps
from flask import Flask, redirect, render_template, session, url_for, jsonify
import os
from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for
from models import get_user_by_oauth_id

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")
print(app.secret_key)

oauth = OAuth(app)

oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration',
)

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # if 'user' not in session:
        #     return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated

def get_current_user():
    return session.get('user')

def home():
    return render_template(
        "home.html",
        session=session.get("user"),
        pretty=json.dumps(session.get("user"), indent=4),
    )

def callback():
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    # After successful login, create/update user in database
    user_info = token.get('userinfo')
    user_data = {
        "oauth_id": user_info['sub'],
        "name": user_info['name'],
        "email": user_info['email'],
        "profile_pic": user_info.get('picture', '')
    }
    from models import create_or_update_user
    create_or_update_user(user_data)
    # Redirect to frontend home page
    return redirect(f"{os.getenv('FRONTEND_URL')}/")

def get_user_data():
    tmp_user = session.get("user")
    if tmp_user:
        if tmp_user.get("userinfo"):
            return get_user_by_oauth_id(tmp_user["userinfo"]["sub"])
    return None

def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )

def logout():
    session.clear()
    return redirect(
        "https://"
        + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": url_for("index", _external=True),
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )