from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)
auth_bp.mongo = None  # Will be injected from app.py

@auth_bp.route("/register", methods=["POST"])
def register():
    mongo = auth_bp.mongo or current_app.mongo  # Use injected Mongo instance or fallback to current_app

    # Debug: Verify MongoDB instance in the route
    if mongo is None:
        print("Error: MongoDB instance is None in register route.")
        return jsonify({"error": "Mongo not initialized"}), 500

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "All fields required"}), 400

    existing_user = mongo.db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully!"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    mongo = auth_bp.mongo or current_app.mongo  # Use injected Mongo instance or fallback to current_app

    # Debug: Verify MongoDB instance in the route
    if mongo is None:
        print("Error: MongoDB instance is None in login route.")
        return jsonify({"error": "MongoDB not initialized"}), 500

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password required"}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }), 200
