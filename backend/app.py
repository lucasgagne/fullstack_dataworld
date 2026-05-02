# # import firebase_admin
# # from firebase_admin import credentials, firestore, auth
# # from flask import Flask, jsonify, request
# # from flask_cors import CORS
# # import os
# # import json
# # from functools import wraps
# # from dotenv import load_dotenv

# # load_dotenv()

# # # --- 1. FIREBASE INITIALIZATION ---
# # try:
# #     if not firebase_admin._apps:
# #         firebase_key = json.loads(os.environ["FIREBASE_KEY"])
# #         cred = credentials.Certificate(firebase_key)
# #         firebase_admin.initialize_app(cred)
# # except Exception as e:
# #     print(f"Firebase Initialization Error: {e}")

# # db = firestore.client()
# # app = Flask(__name__)

# # # --- 2. CORS SETUP ---
# # # Standard CORS often fails with Authorization headers unless explicitly told to allow them
# # CORS(app, resources={r"/*": {
# #     "origins": "*", 
# #     "allow_headers": ["Authorization", "Content-Type"],
# #     "methods": ["GET", "POST", "OPTIONS"]
# # }})

# # # --- 3. AUTH DECORATOR ---
# # def token_required(f):
# #     @wraps(f)
# #     def decorated(*args, **kwargs):
# #         # 1. Handle the "Handshake" (Preflight)
# #         if request.method == 'OPTIONS':
# #             return '', 200
            
# #         token = None
# #         if 'Authorization' in request.headers:
# #             auth_header = request.headers['Authorization']
# #             token = auth_header.split(" ")[1] if " " in auth_header else auth_header

# #         if not token:
# #             return jsonify({"message": "Token is missing!"}), 401
        
# #         try:
# #             decoded_token = auth.verify_id_token(token)
# #             request.uid = decoded_token['uid']
# #         except Exception as e:
# #             return jsonify({"message": "Token is invalid!", "error": str(e)}), 401
            
# #         return f(*args, **kwargs)
# #     return decorated

# # # --- 4. ROUTES ---

# # @app.route('/')
# # def health_check():
# #     return jsonify({"message": "Python Backend is Live! 🚀"})

# # @app.route('/world', methods=['GET', 'OPTIONS'])
# # @token_required
# # def world():
# #     return jsonify({
# #         "message": f"Python says: Hello User {request.uid}, here is the World Data! 🌍"
# #     })

# # @app.route('/api/user-status', methods=['GET', 'OPTIONS'])
# # @token_required
# # def get_user_status():
# #     return jsonify({
# #         "message": "Backend Verified!",
# #         "uid": request.uid
# #     })

# # @app.route('/api/clients', methods=['GET', 'OPTIONS'])
# # @token_required
# # def get_clients():
# #     try:
# #         user_doc = db.collection('users').document(request.uid).get()
# #         if user_doc.exists:
# #             return jsonify([{"id": user_doc.id, **user_doc.to_dict()}]), 200
# #         return jsonify([]), 200
# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500
    
# # @app.route('/api/get-profile', methods=['GET', 'OPTIONS'])
# # @token_required
# # def get_profile():
# #     try:
# #         user_doc = db.collection('users').document(request.uid).get()
        
# #         if user_doc.exists:
# #             data = user_doc.to_dict()
# #             # Return the profile section we saved earlier
# #             return jsonify(data.get("profile", {})), 200
# #         else:
# #             return jsonify({"message": "No profile found"}), 404
            
# #     except Exception as e:
# #         print(f"Load Error: {e}")
# #         return jsonify({"error": str(e)}), 500


# # @app.route('/api/save-profile', methods=['POST', 'OPTIONS'])
# # @token_required
# # def save_profile():
# #     try:
# #         json_payload = request.get_json()
        
# #         # 1. Clean the earnings: Convert [["Job", "100"]] to [{"label": "Job", "value": "100"}]
# #         raw_earnings = json_payload.get('earnings', [])
# #         clean_earnings = [
# #             {"label": row[0], "value": row[1]} 
# #             for row in raw_earnings if len(row) >= 2
# #         ]

# #         # 2. Clean the spendings: Same logic
# #         raw_spendings = json_payload.get('spendings', [])
# #         clean_spendings = [
# #             {"label": row[0], "value": row[1]} 
# #             for row in raw_spendings if len(row) >= 2
# #         ]

# #         # 3. Reference and Save
# #         user_ref = db.collection('users').document(request.uid)
# #         user_ref.set({
# #             "profile": {
# #                 "earnings": clean_earnings,
# #                 "spendings": clean_spendings
# #             },
# #             "lastUpdated": firestore.SERVER_TIMESTAMP 
# #         }, merge=True)
        
# #         return jsonify({"message": "Saved successfully"}), 200

# #     except Exception as e:
# #         print(f"CRASH IN SAVE-PROFILE: {str(e)}") 
# #         return jsonify({"error": str(e)}), 500


# # @app.route('/calculate', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is here
# # @token_required # Add security
# # def calculate():
# #     # If it's a preflight check, the decorator handles it, 
# #     # but let's make sure the logic is sound:
# #     data = request.get_json(silent=True)
# #     if not data:
# #         return jsonify({"error": "No data provided"}), 400
    
# #     # YOUR ACTUAL MATH LOGIC GOES HERE
# #     # For now, we return dummy data so the UI works:
# #     return jsonify({
# #         "message": "Success",
# #         "monthly_savings": 1234,
# #         "yearly_savings": 14808,
# #         "pie_chart": None # We can fix the chart logic next
# #     })
    

# # def calculate_node(node, totals_map):
# #     """
# #     Recursively calculates monthly totals based on the 'logic' selection.
# #     """
# #     factors = {'daily': 30.44, 'weekly': 4.33, 'bi-weekly': 2.16, 'monthly': 1, 'yearly': 1/12}
    
# #     # If the user selected 'summed', we add up the children
# #     if node.get('logic') == 'summed':
# #         node_total = 0
# #         for child in node.get('children', []):
# #             node_total += calculate_node(child, totals_map)
# #     else:
# #         # If 'manual', use the direct input value
# #         val = float(node.get('manualValue') or 0)
# #         freq = node.get('timeframe', 'monthly')
# #         node_total = val * factors.get(freq, 1)

# #     totals_map[node.id] = node_total
# #     return node_total

# # @app.route('/calculate-tree', methods=['POST'])
# # def calculate_tree():
# #     data = request.json
# #     tree = data.get('tree')
# #     totals = {}
    
# #     # We don't calculate the 'root' itself, but we calculate its top-level children
# #     for main_cat in tree.get('children', []):
# #         calculate_node(main_cat, totals)
        
# #     return jsonify({"totals": totals})



# # # --- 5. START SERVER ---
# # if __name__ == '__main__':
# #     # ONLY ONE block of this at the very bottom!
# #     port = int(os.environ.get("PORT", 5001))
# #     print(f"Server starting on port {port}...")
# #     app.run(host='0.0.0.0', port=port, debug=True)

# import firebase_admin
# from firebase_admin import credentials, firestore, auth
# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import os
# import json
# from functools import wraps
# from dotenv import load_dotenv

# load_dotenv()

# # --- 1. FIREBASE INITIALIZATION ---
# try:
#     if not firebase_admin._apps:
#         # Check if we are local or on Render/Vercel
#         if os.environ.get("FIREBASE_KEY"):
#             firebase_key = json.loads(os.environ["FIREBASE_KEY"])
#             cred = credentials.Certificate(firebase_key)
#             firebase_admin.initialize_app(cred)
#         else:
#             # Fallback for local dev if you use a serviceAccount.json file
#             cred = credentials.Certificate("serviceAccount.json")
#             firebase_admin.initialize_app(cred)
# except Exception as e:
#     print(f"Firebase Initialization Error: {e}")

# db = firestore.client()
# app = Flask(__name__)

# # --- 2. CORS SETUP (Multi-Environment) ---
# # This allows your local React (5173) AND your future deployed frontend URLs
# CORS(app, resources={r"/*": {
#     "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*.vercel.app"], 
#     "allow_headers": ["Authorization", "Content-Type"],
#     "methods": ["GET", "POST", "OPTIONS"]
# }})

# # --- 3. AUTH DECORATOR ---
# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         if request.method == 'OPTIONS':
#             return '', 200
            
#         token = None
#         if 'Authorization' in request.headers:
#             auth_header = request.headers['Authorization']
#             token = auth_header.split(" ")[1] if " " in auth_header else auth_header

#         if not token:
#             return jsonify({"message": "Token is missing!"}), 401
        
#         try:
#             decoded_token = auth.verify_id_token(token)
#             request.uid = decoded_token['uid']
#         except Exception as e:
#             return jsonify({"message": "Token is invalid!", "error": str(e)}), 401
            
#         return f(*args, **kwargs)
#     return decorated

# # --- 4. RECURSIVE CALCULATION LOGIC ---
# def calculate_node(node, totals_map):
#     """
#     Recursively calculates monthly totals.
#     """
#     factors = {
#         'daily': 30.44, 
#         'weekly': 4.33, 
#         'bi-weekly': 2.16, 
#         'monthly': 1, 
#         'yearly': 1/12
#     }
    
#     if node.get('logic') == 'summed':
#         node_total = 0
#         for child in node.get('children', []):
#             node_total += calculate_node(child, totals_map)
#     else:
#         try:
#             val = float(node.get('manualValue') or 0)
#         except ValueError:
#             val = 0
#         freq = node.get('timeframe', 'monthly')
#         node_total = val * factors.get(freq, 1)

#     # Use .get('id') because 'node' is a dictionary
#     node_id = node.get('id')
#     if node_id:
#         totals_map[node_id] = node_total
        
#     return node_total

# # --- 5. ROUTES ---

# @app.route('/calculate-tree', methods=['POST', 'OPTIONS'])
# @token_required # Adds the security/CORS handling
# def calculate_tree():
#     data = request.get_json()
#     if not data or 'tree' not in data:
#         return jsonify({"error": "No tree data provided"}), 400
        
#     tree = data.get('tree')
#     totals = {}
    
#     # Calculate top-level children (Income, Savings, Spending)
#     for main_cat in tree.get('children', []):
#         calculate_node(main_cat, totals)
        
#     return jsonify({"totals": totals})

# # Keep your other routes (health_check, get_profile, etc.) here...

# # --- 6. START SERVER ---
# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 5001))
#     app.run(host='0.0.0.0', port=port, debug=True)
    
    
    
    
import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

# --- 1. FIREBASE INITIALIZATION ---
try:
    if not firebase_admin._apps:
        if os.environ.get("FIREBASE_KEY"):
            firebase_key = json.loads(os.environ["FIREBASE_KEY"])
            cred = credentials.Certificate(firebase_key)
            firebase_admin.initialize_app(cred)
        else:
            cred = credentials.Certificate("serviceAccount.json")
            firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Firebase Initialization Error: {e}")

db = firestore.client()
app = Flask(__name__)

# --- 2. CORS SETUP ---
# Added explicit support for the Authorization header
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*.vercel.app"], 
    "allow_headers": ["Authorization", "Content-Type"],
    "methods": ["GET", "POST", "OPTIONS"]
}})

# --- 3. AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
            
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header

        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        
        try:
            decoded_token = auth.verify_id_token(token)
            request.uid = decoded_token['uid']
        except Exception as e:
            return jsonify({"message": "Token is invalid!", "error": str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated

# --- 4. CALCULATION LOGIC ---
def calculate_node(node, totals_map):
    factors = {
        'daily': 30.44, 
        'weekly': 4.33, 
        'bi-weekly': 2.16, 
        'monthly': 1, 
        'yearly': 1/12
    }
    
    if node.get('logic') == 'summed':
        node_total = 0
        for child in node.get('children', []):
            node_total += calculate_node(child, totals_map)
    else:
        try:
            val = float(node.get('manualValue') or 0)
        except (ValueError, TypeError):
            val = 0
        freq = node.get('timeframe', 'monthly')
        node_total = val * factors.get(freq, 1)

    node_id = node.get('id')
    if node_id:
        totals_map[node_id] = node_total
    return node_total

# --- 5. ROUTES ---

@app.route('/')
def health_check():
    return jsonify({"message": "Python Backend is Live! 🚀"})

@app.route('/api/user-status', methods=['GET', 'OPTIONS'])
@token_required
def get_user_status():
    # This is what Home.jsx needs to show the UID!
    return jsonify({
        "message": "Backend Verified!",
        "uid": request.uid
    })

@app.route('/calculate-tree', methods=['POST', 'OPTIONS'])
@token_required 
def calculate_tree():
    data = request.get_json()
    if not data or 'tree' not in data:
        return jsonify({"error": "No tree data provided"}), 400
        
    tree = data.get('tree')
    totals = {}
    
    for main_cat in tree.get('children', []):
        calculate_node(main_cat, totals)
        
    return jsonify({"totals": totals})

# --- 6. START SERVER ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"Server starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)