from flask import render_template
from flask import Flask
app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "yehbbcf83725gfbefuwfew08348gsfe73dwdw2"

@app.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(app.run(host='0.0.0.0', port=8080))