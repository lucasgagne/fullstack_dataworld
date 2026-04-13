import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# Initialize Firebase Admin
# Make sure this file is in your /backend folder!
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

# IMPORTANT: Added your Vercel Preview URL pattern to origins
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173", 
    "https://fullstack-dataworld.vercel.app"
]}})

@app.route('/world-data')
def get_world_data():
    # Make sure 'excel_data' matches the collection name in Firestore
    docs = db.collection('excel_data').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify({"message": "Data Loaded from Firebase!", "payload": data})

@app.route('/login', methods=['POST'])
def login():
    # In a real app, React sends a token, Python verifies it
    id_token = request.json.get('token')
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return jsonify({"status": "success", "uid": uid})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401

@app.route('/')
def home():
    return jsonify({"message": "Python says: Welcome Home! 🏠 sugma dick!"})

@app.route('/welcome/<name>')
def welcome(name):
    # Flask captures whatever is in the <name> part of the URL
    return {"message": f"Welcome {name}, the backend is ready for your data!"}


# @app.route('/calculate/<data>')
# def calculate(data):
#     return jsonify({"message": f"Received: {data}"})

@app.route('/calculate/<data>')
def calculate(data):
    print("the data: ", data)
    import json

    try:
        grid = json.loads(data)

        total = 0
        for row in grid:
            try:
                total += float(row[1])
            except:
                pass

        return jsonify({
            "total_sum": total,
            "rows_received": len(grid),
            "message": "Calculation complete"
        })

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/world')
def world():
    return jsonify({"message": "Python says: Here is the World Data! 🌍"})

@app.route('/finance')
def finance():
    return jsonify({"message": "Python says: Financial Plan Loaded! 💰"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)