from flask import Blueprint, request, jsonify
from flask import current_app as app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

auth = Blueprint('auth', __name__)

@auth.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "All fields required"}), 400

    user = app.mongo.db.users.find_one({"email": email})
    if user:
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = generate_password_hash(password)
    app.mongo.db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw
    })

    return jsonify({"message": "User registered successfully"}), 201

@auth.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = app.mongo.db.users.find_one({"email": email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "email": user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        app.config['JWT_SECRET'],
        algorithm="HS256"
    )

    return jsonify({
        "token": token,
        "name": user['name'],
        "email": user['email']
    }), 200

@auth.route('/api/user', methods=['GET'])
def get_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token missing"}), 401

    try:
        decoded = jwt.decode(token, app.config['JWT_SECRET'], algorithms=["HS256"])
        email = decoded.get("email")
        user = app.mongo.db.users.find_one({"email": email})

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "name": user['name'],
            "email": user['email']
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 403
