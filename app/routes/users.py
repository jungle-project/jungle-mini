# app/routes/users.py
from math import ceil
from flask import Blueprint, request, jsonify
from flask_login import login_required
from app import mongo

bp = Blueprint("users", __name__, url_prefix="/api/users")

@bp.get("")
@login_required
def list_users():
    # ── 1) 파라미터
    sort  = request.args.get("sort", "name")          # name | praises
    page  = max(1, int(request.args.get("page", 1)))
    q     = request.args.get("q", "").strip().lower() # 검색어 (없으면 "")
    limit = 9
    skip  = (page - 1) * limit

    # ── 2) 검색 조건
    match = {}
    if q:
        match["name_lc"] = { "$regex": q }            # 소문자 이름으로 검색

    # ── 3) 파이프라인
    pipeline = [
        { "$addFields": { "name_lc": { "$toLower": "$name" } }},
        { "$match": match },

        { "$lookup": {  # &lookup => mongodb에서 join할때 쓰는 문법
            "from": "praises",  # join 할 collection
            "localField": "_id", # join할 key
            "foreignField": "to_id", # join 할 collection의 key
            "as": "p" # join으로 새로 생설될 field의 alias
        }},
        { "$addFields": { "praises": { "$size": "$p" } }},
        { "$project": { "p": 0, "password": 0, "name_lc": 0 } },

        { "$sort": { "name": 1 } } if sort == "name"
                  else { "$sort": { "praises": -1, "name": 1 } },

        { "$skip": skip }, { "$limit": limit }
    ]
    users = list(mongo.db.users.aggregate(pipeline))
    for u in users:
        u["_id"] = str(u["_id"])

    # ── 4) 전체 페이지 계산
    total_cnt   = mongo.db.users.count_documents(match)
    total_pages = ceil(total_cnt / limit) or 1

    # ── 5) 응답
    return jsonify({
        "users": users,
        "totalPages": total_pages
    })
    
@bp.get("/top")
@login_required
def top_users():
    limit = int(request.args.get("limit", 10))
    pipeline = [
        { "$lookup": {
            "from": "praises",
            "localField": "_id",
            "foreignField": "to_id",
            "as": "p"
        }},
        { "$addFields": { "praises": { "$size": "$p" } } },
        { "$sort": { "praises": -1, "name": 1 } },
        { "$limit": limit },
        { "$project": { "_id":0, "name":1, "praises":1 } }
    ]
    return jsonify(list(mongo.db.users.aggregate(pipeline)))