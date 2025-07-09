# app/routes/praises.py
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from app import mongo

bp = Blueprint("praise", __name__, url_prefix="/praises")

# ────────────────── 공통 헬퍼 ──────────────────
def oid_to_str(doc, keys=("_id", "from_id", "to_id")):
    """ObjectId → str 변환을 한꺼번에 처리"""
    for k in keys:
        if k in doc:
            doc[k] = str(doc[k])
    return doc
# ─────────────────────────────────────────────

# 1) 칭찬 작성 (Create)
@bp.post("/")
@login_required
def create_praise():
    data  = request.json or {}
    to_id = data.get("to_id")
    text  = (data.get("content") or "").strip()

    if not to_id or not text:
        abort(400, "to_id와 content가 필요합니다.")
    if to_id == current_user.id:
        abort(400, "자기 자신에게는 칭찬을 남길 수 없습니다.")
    if not mongo.db.users.find_one({"_id": ObjectId(to_id)}):
        abort(404, "존재하지 않는 사용자입니다.")

    pid = mongo.db.praises.insert_one({
        "from_id":    ObjectId(current_user.id),
        "to_id":      ObjectId(to_id),
        "content":    text,
        "like_count": 0,                    # 향후 공감 수용
        "created_at": datetime.utcnow()
    }).inserted_id

    return {"praise_id": str(pid)}, 201


# 2) 특정 칭찬 조회 (Read one)
@bp.get("/<praise_id>")
def get_praise(praise_id):
    p = mongo.db.praises.find_one({"_id": ObjectId(praise_id)})
    if not p:
        abort(404)
    return oid_to_str(p)


# 3) 내가 받은 칭찬 리스트
@bp.get("/received/<user_id>")
def list_received(user_id):
    cur  = mongo.db.praises.find({"to_id": ObjectId(user_id)}).sort("created_at", -1)
    docs = [oid_to_str(d) for d in cur]
    return jsonify(docs)


# 4) 내가 보낸 칭찬 리스트
@bp.get("/sent")
@login_required
def list_sent_by_me():
    cur  = mongo.db.praises.find({"from_id": ObjectId(current_user.id)}).sort("created_at", -1)
    docs = [oid_to_str(d) for d in cur]
    return jsonify(docs)

# 5) top10 칭찬 
@bp.get("/top")
@login_required
def top_praises():
    limit = int(request.args.get("limit", 10))

    pipeline = [
        #  likes(공감) → praise_id 별로 개수 세기
        { "$group": { "_id": "$praise_id", "likes": { "$sum": 1 } } },

        #  가장 많이 받은 순으로 정렬
        { "$sort": { "likes": -1 } },
        { "$limit": limit },

        #  본문·받은 사람 이름 가져오기 (praises + users 조인)
        { "$lookup": {
            "from": "praises",
            "localField": "_id",
            "foreignField": "_id",
            "as": "p"
        }},
        { "$unwind": "$p" },
        { "$lookup": {
            "from": "users",
            "localField": "p.to_id",
            "foreignField": "_id",
            "as": "u"
        }},
        { "$unwind": "$u" },

        #  필요한 필드만
        { "$project": {
            "_id": 0,
            "receiver": "$u.name",
            "content" : "$p.content",
            "likes"   : 1
        }}
    ]

    docs = list(mongo.db.likes.aggregate(pipeline))
    return jsonify(docs)