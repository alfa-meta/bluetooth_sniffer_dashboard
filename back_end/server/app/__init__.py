from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO
from .models import db

bcrypt = Bcrypt()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins=["http://localhost:3000", "http://localhost:5000"])

def populate_device_vendors():
    from .models import DeviceVendor
    if DeviceVendor.query.count() < 1000:
        print("Uploading Vendor list")
        with open("mac_vendor_list.txt", "r") as file:
            for line in file:
                parts = line.strip().split(" - ")
                if len(parts) == 3:
                    _, mac_prefix, vendor = parts
                    if not DeviceVendor.query.get(mac_prefix):
                        db.session.add(DeviceVendor(mac_address_prefix=mac_prefix, vendor_name=vendor))
        db.session.commit()
        print("Vendor list uploaded!")

    print("Vendor list is already uploaded")

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5000"])
    app.config.from_object('config.Config')

    db.init_app(app)
    bcrypt.init_app(app)  
    jwt.init_app(app)

    with app.app_context():
        from .models import User, Device, Logs, DeviceVendor  # Ensure all models are imported

        db.create_all()
        populate_device_vendors()

    from .routes import main_bp, websocket_handle_connect, websocket_start_scan, websocket_stop_scan, websocket_handle_disconnect
    app.register_blueprint(main_bp)

    socketio.init_app(app)
    socketio.on_event("websocket_handle_connect", websocket_handle_connect)
    socketio.on_event("websocket_start_scan", websocket_start_scan)
    socketio.on_event("websocket_stop_scan", websocket_stop_scan)
    socketio.on_event("websocket_handle_disconnect", websocket_handle_disconnect)

    return app, socketio
