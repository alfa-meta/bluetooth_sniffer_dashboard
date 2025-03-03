import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Define the correct path to devices.db
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sniffer', 'outputs', 'devices.db'))

# Set the database URI
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User(db.Model):
    __tablename__ = "USER"
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)  # Move password before email
    email = db.Column(db.String(100), unique=True, nullable=False)


@app.route("/register", methods=["POST"])
def register():
    """ Register a new user with hashed password. """
    try:
        data = request.get_json()
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already registered"}), 400
        
        hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = User(username=data["username"], email=data["email"], password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created"}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@app.route("/login", methods=["POST"])
def login():
    """Authenticate user using email and password, then return JWT token."""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        print(data)

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.email)
            return jsonify(access_token=access_token), 200

        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    """ JWT-protected route returning the logged-in user's details. """
    try:
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()

        if user:
            return jsonify({"email": user.email}), 200

        print("User not found")
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print("Error: ", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500

@app.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    """ JWT-protected route to get all users. """
    try:
        users = User.query.all()
        user_list = [
            {"uid": user.uid, "username": user.username, "email": user.email, "password": user.password}
            for user in users
        ]
        print(user_list)
        return jsonify(user_list), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
