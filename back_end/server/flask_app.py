import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity


load_dotenv()  # Load environment variables from .env file
app = Flask(__name__)
# Define the correct path to devices.db
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sniffer', 'outputs', 'devices.db'))

# Set the database URI
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)  # Add email column
    password = db.Column(db.String(100), nullable=False)

@app.route("/register", methods=["POST"])
def register():
    """
        Accepts username and password (JSON format).
        Hashes the password and saves it in the database.
        Returns success message.

        :return message: in JSON format {message : info}, number
    """
    
    data = request.get_json()
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(username=data["username"], email=data["email"], password=hashed_pw)  # Include email
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@app.route("/login", methods=["POST"])
def login():
    """
        Checks if the user exists and verifies the password.
        If valid, returns a JWT access token.
        If invalid, returns a 401 error.
    """
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and bcrypt.check_password_hash(user.password, data["password"]):
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token)
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    """ 
        Requires JWT authentication.
        Returns the currently logged-in user's identity.
    """
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
