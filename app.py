from flask import Flask, render_template, request

app = Flask(__name__)
@app.route('/')
def index():
    return render_template("main/index.html", active_tab='main')

@app.route('/login')
def login():
    return render_template("login/login.html")

@app.route('/signup')
def signup():
    return render_template("login/signup.html")

@app.route('/findpassword')
def findpassword():
    return render_template("login/findPassword.html")

@app.route('/profile')
def profile():
    return render_template("main/profile.html")

@app.route('/modal')
def modal():
    mode = request.args.get('mode', default = 'readonly', type = str)
    return render_template('modal/praiseModal.html', mode=mode)

if __name__ == '__main__':
    app.run(debug=True)