"""Python Flask WebApp Auth0 integration example
"""

import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)






@app.route("/callback", methods=["GET", "POST"])



@app.route("/login")



@app.route("/logout")



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 3000))
