from flask import Blueprint, render_template

bp = Blueprint(
    "web",
    __name__,
    template_folder="../templates",
)

@bp.route("/find-password")
def find_password_page():
    return render_template("login/passwordForm.html")
