# app/utils.py
import os
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

ts = URLSafeTimedSerializer(os.getenv("SECRET_KEY"))

def generate_token(email: str, salt: str):
    return ts.dumps(email, salt=salt)

def confirm_token(token: str, salt: str, expiration=1800):
    return ts.loads(token, salt=salt, max_age=expiration) 