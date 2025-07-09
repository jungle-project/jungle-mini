from flask import Flask, render_template

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
    return render_template("login/findpassword.html")

if __name__ == '__main__':
    app.run(debug=True)