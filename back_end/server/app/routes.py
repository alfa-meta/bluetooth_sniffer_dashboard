from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, verify_jwt_in_request, decode_token
from flask_bcrypt import Bcrypt
from flask_socketio import emit, disconnect
import threading
import subprocess

from config import Config
from .models import Device, User, Logs, DeviceVendor, db
from . import socketio
from .functions import set_websocket_connected, query_mac_vendors_api
import time

main_bp = Blueprint('main', __name__)
bcrypt = Bcrypt()

PASSWORD_SALT = Config.PASSWORD_SALT
processes = {}
process_threads = {}

scan_thread = threading.Event()
stop_scan_event = threading.Event()

if not Config.PASSWORD_SALT or not Config.JWT_SECRET_KEY:
    raise ValueError(f"Environment variables PASSWORD_SALT is {PASSWORD_SALT} JWT_SECRET_KEY is {Config.JWT_SECRET_KEY} must be set.")


@main_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data or "email" not in data or "password" not in data or "username" not in data:
            return jsonify({"message": "Missing required fields"}), 400

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already registered"}), 400

        hashed_pw = bcrypt.generate_password_hash(data["password"] + PASSWORD_SALT).decode("utf-8")

        user = User(username=data["username"], email=data["email"], password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.email)
        return jsonify(access_token=access_token, email=user.email), 200
    except Exception as e:
        print("Error in register:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500


@main_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data or "email" not in data or "password" not in data:
            return jsonify({"message": "Email and password are required"}), 400

        user = User.query.filter_by(email=data["email"]).first()

        if user and bcrypt.check_password_hash(user.password, data["password"] + PASSWORD_SALT):
            access_token = create_access_token(identity=user.email)
            return jsonify(access_token=access_token, email=user.email), 200

        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print("Error in login:", e)
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
        print(f"Error in protected route: {e}")
        return jsonify({"message": "An error occurred, please try again later"}), 500


@main_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    try:
        users = User.query.all()
        user_list = [{"uid": user.uid, "username": user.username, "email": user.email} for user in users]
        return jsonify(user_list), 200
    except Exception as e:
        print(f"Error in get_all_users: {e}")
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
        print(f"Error in delete_user: {e}")
        return jsonify({"message": "An error occurred, please try again later"}), 500


@main_bp.route('/devices', methods=['GET'])
@jwt_required()
def get_all_devices():
    try:
        devices = Device.query.all()
        device_list = [{"mac_address": d.mac_address, "device_vendor": d.device_vendor, "device_name": d.device_name, "date_added": d.date_added, "email": d.email} for d in devices]
        return jsonify(device_list), 200
    except Exception as e:
        print(f"Error in get_all_devices: {e}")
        return jsonify({"message": "An error occurred, please try again later"}), 500

@main_bp.route("/delete_device/<string:mac_address>", methods=["DELETE"])
@jwt_required()
def delete_device(mac_address):
    try:
        device = Device.query.filter_by(mac_address=mac_address).first()
        if not device:
            return jsonify({"message": "Device not found"}), 404

        db.session.delete(device)
        db.session.commit()
        return jsonify({"message": "Device deleted successfully"}), 200
    except Exception as e:
        print(f"Error in delete_device: {e}")
        return jsonify({"message": "An error occurred, please try again later"}), 500
    
@main_bp.route("/add_device", methods=["POST"])
@jwt_required()
def add_device():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400

        mac_address = data.get("mac_address")
        device_vendor = "Unknown"
        device_name = data.get("device_name")
        date_added = data.get("date_added")
        email = data.get("email")

        if not all([mac_address, device_name, device_vendor, date_added, email]):
            return jsonify({"message": "Missing required fields"}), 400

        # Check DeviceVendor table row count
        vendor_count = DeviceVendor.query.count()
        print(f"vendor_count: {vendor_count}")
        if vendor_count > 10000:
            mac_prefix = mac_address.lower()[:8]
            print(f"mac_prefix: {mac_prefix}")
            vendor = DeviceVendor.query.filter_by(mac_address_prefix=mac_prefix).first()
            if vendor:
                device_vendor = vendor.vendor_name
                print(f"device_name: {device_name}")
            else:
                device_vendor = query_mac_vendors_api(mac_prefix)
                print(f"Response: {device_vendor}")

        new_device = Device(
            mac_address=mac_address,
            device_name=device_name,
            device_vendor=device_vendor,
            date_added=date_added,
            email=email
        )

        print(new_device)

        db.session.add(new_device)
        db.session.commit()

        return jsonify({"message": "Device added successfully"}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred, please try again later"}), 500


@main_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_all_logs():
    try:
        logs = Logs.query.all()
        logs_list = [
            {
                "mac_address": log.mac_address,
                "device_vendor": log.device_vendor,
                "target_device": log.target_device,
                "first_seen": log.first_seen,
                "last_seen": log.last_seen,
                "count": log.count,
                "scan_number": log.scan_number,
            }
            for log in logs
        ]
        return jsonify(logs_list), 200
    except Exception as e:
        print(f"Error in get_all_logs: {e}")
        return jsonify({"message": "An error occurred, please try again later"}), 500


@socketio.on("websocket_handle_connect")
def websocket_handle_connect():
    token = request.args.get("token")  # Extract token from query params
    if not token:
        set_websocket_connected(path="config.json", value=False)
        print("Missing token, disconnecting WebSocket.")
        disconnect()
        return

    try:
        decoded_token = decode_token(token)  # Manually decode the JWT token
        user_email = decoded_token.get("sub")  # Extract user identity
        if not user_email:
            set_websocket_connected(path="config.json", value=False)
            raise ValueError("Invalid token payload")

        set_websocket_connected(path="config.json", value=True)
        print(f"User {user_email} connected via WebSocket")
    except Exception as e:
        set_websocket_connected(path="config.json", value=False)
        print(f"WebSocket connection error: {e}")
        disconnect()

def process_monitor(user_email, process, stop_event, sid):
    """Background thread function to monitor process output"""
    try:
        # Buffer for incomplete lines
        buffer = ""
        
        while process.poll() is None and not stop_event.is_set():
            # Read from stdout without blocking
            output = process.stdout.read(4096)
            if output:
                # Decode and handle the output
                text = output.decode('utf-8', errors='replace')
                buffer += text
                lines = buffer.split('\n')
                buffer = lines.pop()  # Keep the last (potentially incomplete) line
                
                for line in lines:
                    if line:  # Only emit non-empty lines
                        socketio.emit("scan_update", {"message": line.strip()}, room=sid)
            else:
                # Small sleep to prevent CPU hogging when no output
                socketio.sleep(0.1)
        
        # Process any remaining data in the buffer
        if buffer:
            socketio.emit("scan_update", {"message": buffer.strip()}, room=sid)
            
        # Get return code
        return_code = process.poll()
        if return_code is not None:
            socketio.emit("scan_update", {"message": f"Process completed Successfully with no Errors."}, room=sid)
        else:
            # If we got here and the process is still running, terminate it
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            socketio.emit("scan_update", {"message": "Process was terminated"}, room=sid)
            
    except Exception as e:
        socketio.emit("scan_update", {"message": f"Error monitoring process: {str(e)}"}, room=sid)
    finally:
        # Clean up
        socketio.emit("scan_stop", {"message": f"Process completed with return code {return_code}"}, room=sid)
        if user_email in processes:
            # Only delete if it's still the same process
            if processes[user_email] == process:
                del processes[user_email]
                
        if user_email in process_threads:
            # Only delete if it's still the same thread
            del process_threads[user_email]
            
        stop_event.set()  # Make sure the event is set

@socketio.on("websocket_start_scan")
def websocket_start_scan(data):
    try:
        token = request.args.get("token")
        sid = request.sid
        
        if not token:
            emit("scan_update", {"message": "Error: Missing token"})
            return

        decoded_token = decode_token(token)
        user_email = decoded_token.get("sub")

        # Extract settings from client
        packets = data.get("packets", "100")
        scan_time = data.get("scanTime", "15")
        theme = data.get("theme", "")

        print(f"Received settings from {user_email}: packets={packets}, scanTime={scan_time}, theme={theme}")

        # Stop any existing process
        if user_email in processes and processes[user_email].poll() is None:
            try:
                old_process = processes[user_email]
                old_process.terminate()
                old_process.wait(timeout=3)
                print(f"Terminated existing process for {user_email}")
            except Exception as e:
                print(f"Error terminating process: {e}")

        stop_event = threading.Event()

        # You can pass these as env vars or args if needed by your script
        process = subprocess.Popen(
            ["python3", "-u", "sniffer/main.py", user_email, packets, scan_time],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=False,
            bufsize=0
        )

        processes[user_email] = process
        emit("scan_update", {"message": f"Started scanning process (PID: {process.pid})"})
        print(f"Started scanning process (PID: {process.pid}) for {user_email}")

        monitor_thread = socketio.start_background_task(
            process_monitor,
            user_email=user_email,
            process=process,
            stop_event=stop_event,
            sid=sid
        )

        process_threads[user_email] = (monitor_thread, stop_event)

    except Exception as e:
        print(f"Error in websocket_start_scan: {e}")
        emit("scan_update", {"message": f"Error starting scan: {str(e)}"})

@socketio.on("websocket_stop_scan")
def websocket_stop_scan():
    try:
        token = request.args.get("token")
        if not token:
            emit("scan_update", {"message": "Error: Missing token"})
            return
        
        decoded_token = decode_token(token)
        user_email = decoded_token.get("sub")
        
        if user_email in process_threads:
            _, stop_event = process_threads[user_email]
            stop_event.set()
            emit("scan_update", {"message": "Stopping scan process..."})
            print(f"Stop event set for {user_email}")
        
        if user_email in processes:
            process = processes[user_email]
            if process.poll() is None:  # Check if process is still running
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                print(f"Stopped process {process.pid} for {user_email}")
                emit("scan_update", {"message": f"Scan process terminated (PID: {process.pid})"})
            else:
                emit("scan_update", {"message": f"Process already completed (PID: {process.pid})"})
        else:
            emit("scan_update", {"message": "No active scanning process found"})
            
    except Exception as e:
        print(f"Error in websocket_stop_scan: {e}")
        emit("scan_update", {"message": f"Error stopping scan: {str(e)}"})

@socketio.on("websocket_handle_disconnect")
def websocket_handle_disconnect(reason_for_disconnect=None):
    try:
        token = request.args.get("token")  # Extract token from query params
        if not token:
            print("Missing token during disconnect.")
            return

        decoded_token = decode_token(token)  # Manually decode the JWT token
        user_email = decoded_token.get("sub")  # Extract user identity

        print(f"{user_email} is Disconnecting")
        if reason_for_disconnect is not None:
            print(reason_for_disconnect)
        
        if user_email in process_threads:
            _, stop_event = process_threads[user_email]
            stop_event.set()
            del process_threads[user_email]
        
        if user_email in processes:
            process = processes[user_email]
            if process.poll() is None:  # Check if process is still running
                process.terminate()
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                print(f"Stopped process {process.pid}")
            del processes[user_email]
            
        set_websocket_connected(path="config.json", value=False)
        
    except Exception as e:
        set_websocket_connected(path="config.json", value=False)
        print(f"Error in handle_disconnect: {e}")