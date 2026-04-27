import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from finance.financial_analysis import compute_financials
from finance.charts import generate_spending_pie

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

# --- THE FIX: Clean CORS Setup ---
# This handles all the "OPTIONS" and "Preflight" bullshit automatically.
CORS(app, resources={r"/*": {"origins": "*"}}) 

@app.route('/')
def home():
    return jsonify({"message": "Python says: Welcome Home! 🏠"})

@app.route('/welcome/<name>')
def welcome(name):
    return jsonify({"message": f"Welcome {name}, the backend is ready!"})

# @app.route('/calculate', methods=['POST', 'OPTIONS']) # REMOVE 'OPTIONS' here, CORS handles it
# def calculate():
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({"error": "No data provided"}), 400

#         earnings = data.get("earnings", [])
#         spendings = data.get("spendings", [])

#         # 1. Compute financial numbers
#         results = compute_financials(earnings, spendings)

#         # 2. Generate pie chart
#         pie_chart = generate_spending_pie(results["spending_breakdown"])

#         return jsonify({
#             **results,
#             "pie_chart": pie_chart,
#             "message": "Financial analysis complete"
#         })
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": str(e)}), 500
@app.route('/calculate', methods=['POST', 'OPTIONS'])
def calculate():
    # ✅ Handle preflight FIRST and EXIT EARLY
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # ✅ Only runs for POST now
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        earnings = data.get("earnings", [])
        spendings = data.get("spendings", [])

        results = compute_financials(earnings, spendings)
        pie_chart = generate_spending_pie(results["spending_breakdown"])

        return jsonify({
            **results,
            "pie_chart": pie_chart,
            "message": "Financial analysis complete"
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
@app.route('/world')
def world():
    return jsonify({"message": "Python says: Here is the World Data! 🌍"})

if __name__ == '__main__':
    # Use port from environment variable for Render, default to 5000 for local
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)

