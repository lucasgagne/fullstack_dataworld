from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["https://full-stack-dummy.vercel.app"]
    }
})
@app.route('/')
def home():
    # We return a Dictionary, which Flask turns into JSON automatically
    return jsonify({"message": "Python is talking to React! 🚀"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)