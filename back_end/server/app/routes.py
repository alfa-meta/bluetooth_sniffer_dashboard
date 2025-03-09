from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from flask_bcrypt import Bcrypt
from config import Config
from .models import Device, User, db
import subprocess

main_bp = Blueprint('main', __name__)
bcrypt = Bcrypt()

PASSWORD_SALT = Config.PASSWORD_SALT

@main_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already registered"}), 400

        password = data.get("password")
        hashed_pw = bcrypt.generate_password_hash(password + PASSWORD_SALT).decode("utf-8")

        user = User(username=data["username"], email=data["email"], password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.email)
        return jsonify(access_token=access_token), 200
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()
        
        if user and bcrypt.check_password_hash(user.password, password + PASSWORD_SALT):
            access_token = create_access_token(identity=user.email)
            return jsonify(access_token=access_token), 200
        
        return jsonify({"message": "Invalid credentials"}), 401
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    try:
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()

        if user:
            return jsonify({"email": user.email}), 200

        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/start_scanning", methods=["POST"])
@jwt_required()
def start_scanning():
    try:
        process = subprocess.Popen(["python", "../../sniffer/main.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return jsonify({"message": "Scanning started", "pid": process.pid}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500
