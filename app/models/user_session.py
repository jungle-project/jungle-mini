# app/models/user_session.py
from flask_login import UserMixin
from bson import ObjectId
from app import mongo

class UserSession(UserMixin):
    """
    Flask-Login 이 요구하는 최소 인터페이스를
    MongoDB users 문서에 연결한 thin wrapper
    """
    def __init__(self, doc: dict):
        self.id = str(doc["_id"])
        self.name = doc["name"]
        self.email = doc["email"]
        self.profile_url = doc.get("profile_url", "")

    @staticmethod
    def get(user_id: str):
        doc = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return UserSession(doc) if doc else None
