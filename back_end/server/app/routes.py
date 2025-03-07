from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from flask_bcrypt import Bcrypt
from config import Config
from .models import Device, User, db

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

@main_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    try:
        users = User.query.all()
        user_list = [
            {"uid": user.uid, "username": user.username, "email": user.email}
            for user in users
        ]
        return jsonify(user_list), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/delete_user/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route('/devices', methods=['GET'])
@jwt_required()
def get_all_devices():
    try:
        devices = Device.query.all()
        device_list = [
            {
                'mac_address': device.mac_address,
                'device_name': device.device_name,
                'last_seen': device.last_seen,
                'email': device.email
            }
            for device in devices
        ]
        return jsonify(device_list), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/add_device", methods=["POST"])
@jwt_required()
def add_device():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400

        mac_address = data.get("mac_address")
        device_name = data.get("device_name")
        last_seen = data.get("last_seen")
        email = data.get("email")

        if not all([mac_address, device_name, last_seen, email]):
            return jsonify({"message": "Missing required fields"}), 400

        new_device = Device(
            mac_address=mac_address,
            device_name=device_name,
            last_seen=last_seen,
            email=email
        )
        db.session.add(new_device)
        db.session.commit()

        return jsonify({"message": "Device added successfully"}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500
