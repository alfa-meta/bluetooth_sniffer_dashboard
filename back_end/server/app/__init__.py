from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .models import db

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5000"])
    app.config.from_object('config.Config')

    db.init_app(app)
    Bcrypt(app)
    JWTManager(app)

    with app.app_context():
        db.create_all()

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
