# app/routes/auth.py
from datetime import datetime
from flask import Blueprint, request, url_for, redirect
from flask_login import login_user, logout_user, login_required, current_user
from bson import ObjectId
from app import mongo, bcrypt
from app.models.user_session import UserSession
from app.utils import generate_token, confirm_token
from app.services.email_service import send_email

bp = Blueprint("auth", __name__, url_prefix="/auth")

# ───────── 회원가입 ─────────
@bp.post("/register")
def register():
    data = request.json
    need = {"name", "email", "password"}
    if not need <= data.keys():
        return {"msg": "name·email·password 모두 필요"}, 400

    email = data["email"]
    # users·pending_users 모두 중복 확인
    if mongo.db.users.find_one({"email": email}) or \
       mongo.db.pending_users.find_one({"email": email}):
        return {"msg": "이미 가입(또는 인증 대기) 중인 이메일"}, 409

    hashed = bcrypt.generate_password_hash(data["password"]).decode()
    pid = mongo.db.pending_users.insert_one({
        "name": data["name"],
        "email": email,
        "password": hashed,
        "created_at": datetime.utcnow(),
    }).inserted_id # 이 id만 토큰에 담음

    token = generate_token(str(pid), "email-confirm")
    link  = url_for("auth.verify_email", token=token, _external=True)
    html  = (f"<p>{data['name']}님, "
             f"<a href='{link}'>이메일 인증을 완료하려면 클릭</a>해 주세요.</p>")
    send_email("이메일 인증", [email], html)

    return {"msg": "메일을 확인해 주세요! 24시간 이내 인증 필요"}, 201


# ───────── 이메일 인증 ─────────
@bp.get("/verify/<token>")
def verify_email(token):
    try:
        pid = confirm_token(token, "email-confirm") # pending_users _id
    except Exception:
        return {"msg": "만료·위조된 링크"}, 400

    pend = mongo.db.pending_users.find_one({"_id": ObjectId(pid)})
    if not pend:
        return {"msg": "이미 처리되었거나 존재하지 않는 요청"}, 404

    pend.pop("_id")
    pend["is_verified"] = True
    mongo.db.users.insert_one(pend)                          # users로 이동
    mongo.db.pending_users.delete_one({"_id": pend["_id"]})  # pending 삭제

    return {"msg": "이메일 인증 완료! 이제 로그인하세요."}


# ───────── 로그인 ─────────
@bp.post("/login")
def login():
    data = request.json
    user_doc = mongo.db.users.find_one({"email": data.get("email")})
    if (not user_doc) or \
       (not bcrypt.check_password_hash(user_doc["password"], data.get("password", ""))):
        return {"msg": "이메일 또는 비밀번호 오류"}, 401
    if not user_doc.get("is_verified"):
        return {"msg": "이메일 미인증 계정"}, 403

    user = UserSession(user_doc)
    login_user(user, remember=True)
    return {"msg": "로그인 성공", "user_id": user.id}


# ───────── 로그아웃 ─────────
@bp.post("/logout")
@login_required
def logout():
    logout_user()
    return {"msg": "로그아웃 완료"}


# ───────── 내 정보 조회 ─────────
@bp.get("/me")
@login_required
def me():
    return {
        "user_id": current_user.id,
        "name":    current_user.name,
        "email":   current_user.email,
        "profile_url": current_user.profile_url
    }

# ───────── 비밀번호 재설정 메일 요청 ─────────
@bp.post("/request-reset")
def request_reset():
    email = (request.json or {}).get("email", "").strip()
    user  = mongo.db.users.find_one({"email": email})
    if not user:
        return {"msg": "존재하지 않는 아이디 입니다."}, 200

    token = generate_token(str(user["_id"]), "password-reset")
    link  = url_for("auth.reset_password_page", token=token, _external=True)
    html  = (f"""
            <p>{user['name']}님, 비밀번호를 재설정하려면<br>
            <a href="{link}" style="color:#2d8cf0;text-decoration:none;">
            비밀번호&nbsp;재설정하기
            </a><br>
            30분 안에 진행해 주세요.</p>
            """)
    send_email("[칭찬감옥] 비밀번호 재설정", [email], html)
    return {"msg": "메일을 확인해 주세요."}, 200


# ───────── 재설정 페이지 렌더(프런트용) ─────────
@bp.get("/reset/<token>")
def reset_password_page(token):
    """
    HTML 페이지로 리다이렉트.
    ex) /static/reset.html?token=...
    """
    url = url_for("static", filename="reset.html") + f"?token={token}"
    return redirect(url)             # ← redirect() 로 교체


# ───────── 비밀번호 변경 ─────────
@bp.post("/reset/<token>")
def reset_password(token):
    try:
        uid_str = confirm_token(token, "password-reset", expiration=1800)  # 30분
    except Exception:
        return {"msg": "만료되었거나 잘못된 링크"}, 400

    new_pw = (request.json or {}).get("password", "").strip()
    if len(new_pw) < 8:
        return {"msg": "비밀번호는 최소 8자"}, 400

    hashed = bcrypt.generate_password_hash(new_pw).decode()
    mongo.db.users.update_one(
        {"_id": ObjectId(uid_str)},
        {"$set": {"password": hashed}}
    )
    return {"msg": "비밀번호가 변경되었습니다. 다시 로그인해 주세요."}, 200
