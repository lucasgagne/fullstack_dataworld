from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# List of all "Trustworthy" frontends
allowed_origins = [
    "http://localhost:5173",              # Local Vite default port
    "http://127.0.0.1:5173",             # Local Vite alternative
    "https://fullstack-dataworld.vercel.app" # Your live production site
]

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins
    }
})

@app.route('/')
def home():
    return jsonify({"message": "Python says: Welcome Home! 🏠"})

@app.route('/world')
def world():
    return jsonify({"message": "Python says: Here is the World Data! 🌍"})

@app.route('/finance')
def finance():
    return jsonify({"message": "Python says: Financial Plan Loaded! 💰"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)