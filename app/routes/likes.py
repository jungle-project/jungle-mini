# app/routes/likes.py
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, abort
from flask_login import login_required, current_user
from app import mongo

# URL 구조: /praises/<praise_id>/likes
bp = Blueprint("likes", __name__, url_prefix="/praises")

# ───────── 공감 추가 ─────────
@bp.post("/<praise_id>/likes")
@login_required
def add_like(praise_id):
    pid = ObjectId(praise_id)
    uid = ObjectId(current_user.id)

    # upsert 중복 공감 시 아무 일도 안 일어남
    res = mongo.db.likes.update_one(
        {"praise_id": pid, "user_id": uid},
        {"$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True
    )
    if res.upserted_id: # 새로 들어간 경우에만 +1
        mongo.db.praises.update_one({"_id": pid}, {"$inc": {"like_count": 1}})
    return {"msg": "공감 완료"}, 200

# ───────── 공감 취소 ─────────
@bp.delete("/<praise_id>/likes")
@login_required
def remove_like(praise_id):
    pid = ObjectId(praise_id)
    uid = ObjectId(current_user.id)

    # 실제 삭제가 일어났을 때만 -1
    if mongo.db.likes.delete_one({"praise_id": pid, "user_id": uid}).deleted_count:
        mongo.db.praises.update_one({"_id": pid}, {"$inc": {"like_count": -1}})
    return {"msg": "공감 취소"}, 200

# ───────── 공감 조회 ─────────
@bp.get("/<praise_id>/likes/me")
@login_required
def check_my_like(praise_id):
    pid = ObjectId(praise_id)
    uid = ObjectId(current_user.id)
    liked = mongo.db.likes.find_one({"praise_id": pid, "user_id": uid}) is not None
    return {"liked": liked}