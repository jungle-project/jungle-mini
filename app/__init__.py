# app/__init__.py
import os
from datetime import timedelta
from flask import Flask, redirect, url_for, render_template,request
from flask_pymongo import PyMongo
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager
from flask_session import Session               # ★ 추가
from dotenv import load_dotenv

# ── 확장 객체 ───────────────────────────────────────────
mongo = PyMongo()
mail = Mail()
bcrypt = Bcrypt()
login_manager = LoginManager()
sess = Session()                                # ★ MongoDB 세션용
# ───────────────────────────────────────────────────────

def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # ── 설정 ────────────────────────────────────────────
    app.config.update(
        SECRET_KEY = os.getenv("SECRET_KEY"),
        MONGO_URI  = os.getenv("MONGO_URI"),

        # ─ MongoDB 세션 스토어 ─
        SESSION_TYPE           = "mongodb",
        SESSION_MONGODB        = mongo.cx,  # PyMongo의 MongoClient
        SESSION_MONGODB_DB     = "session_db",
        SESSION_MONGODB_COLLECT= "sessions",
        SESSION_PERMANENT      = False,     # True 로 두고 아래 TTL 사용 가능
        PERMANENT_SESSION_LIFETIME = timedelta(minutes=30),

        # 쿠키 보안 옵션
        SESSION_COOKIE_HTTPONLY = True,
        SESSION_COOKIE_SAMESITE = "Lax",
        SESSION_COOKIE_SECURE   = False,    # HTTPS 배포 시 True

        # ─ 메일 서버 ─
        MAIL_SERVER   = os.getenv("MAIL_SERVER"),
        MAIL_PORT     = int(os.getenv("MAIL_PORT")),
        MAIL_USE_TLS  = os.getenv("MAIL_USE_TLS") == "True",
        MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    )
    # ────────────────────────────────────────────────────

    # ── 확장 초기화 ──────────────────────────────────────
    mongo.init_app(app)
    mail.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    sess.init_app(app)  # 세션 활성화
    # ────────────────────────────────────────────────────

    # ── 프론트엔드 라우트 ────────────────────────────────────
    @app.route("/")
    def index():
        return render_template("login/login.html")
    
    @app.route("/login")
    def login_page():
        return render_template("login/login.html")

    @app.route('/modal')
    def modal():
        mode = request.args.get('mode', default = 'readonly', type = str)
        return render_template('modal/praiseModal.html', mode=mode)
    
    @app.route("/signup")
    def signup_page():
        return render_template("login/signup.html")
    
    @app.route("/findpassword")
    def findpassword_page():
        return render_template("login/findPassword.html")
    
    @app.route('/profile')
    def profile():
        return render_template("main/profile.html")
    
    @app.route("/main")
    def main_page():
        from flask_login import current_user
        if not current_user.is_authenticated:
            return redirect(url_for('login_page'))
        return render_template("main/index.html", active_tab='main')
    
    @app.route("/honor")
    def honor_page():
        from flask_login import current_user
        if not current_user.is_authenticated:
            return redirect(url_for('login_page'))
        return render_template("main/index.html", active_tab='honor')
    
    # 로그인 상태 확인 API
    @app.route("/api/user-info")
    def get_user_info():
        from flask_login import current_user
        if current_user.is_authenticated:
            return {
                "is_authenticated": True,
                "user_id": current_user.id,
                "name": current_user.name,
                "email": current_user.email
            }
        else:
            return {"is_authenticated": False}
    # ────────────────────────────────────────────────────

    # ── Flask-Login user_loader ─────────────────────────
    from app.models.user_session import UserSession
    @login_manager.user_loader
    def load_user(user_id):
        return UserSession.get(user_id)
    # ────────────────────────────────────────────────────

    # ── pending_users TTL 인덱스 (24 h) ─────────────────
    with app.app_context():
        mongo.db.pending_users.create_index(
            [("created_at", 1)], expireAfterSeconds=60*60*24
        )
        # 세션 컬렉션 TTL 인덱스도 보장(중복 생성 시 MongoDB가 무시)
        mongo.cx.session_db.sessions.create_index(
            "expiration", expireAfterSeconds=0
        )
    # ────────────────────────────────────────────────────

    # ── 블루프린트 등록 ─────────────────────────────────
    from app.routes import auth, praises, likes, users
    app.register_blueprint(auth.bp)
    app.register_blueprint(praises.bp)
    app.register_blueprint(likes.bp)
    app.register_blueprint(users.bp)
    # ────────────────────────────────────────────────────

    return app
