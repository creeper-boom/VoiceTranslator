from flask import render_template
from flask import Flask
app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

app.run(host='0.0.0.0', port=8888)