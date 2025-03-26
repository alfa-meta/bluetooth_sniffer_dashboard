from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    devices = db.relationship('Device', backref='user', lazy=True)

class Device(db.Model):
    __tablename__ = 'device'
    mac_address = db.Column(db.String, primary_key=True)
    device_vendor = db.Column(db.String, nullable=False, default='Unknown')
    device_name = db.Column(db.String, nullable=False)
    last_seen = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String, db.ForeignKey('user.email'), nullable=False)

class Logs(db.Model):
    __tablename__ = 'logs'
    mac_address = db.Column(db.String, primary_key=True)
    device_vendor = db.Column(db.String, nullable=False, default='Unknown')
    target_device = db.Column(db.Boolean, default=False, server_default='0')
    first_seen = db.Column(db.Integer, nullable=False)
    last_seen = db.Column(db.Integer, nullable=False)
    count = db.Column(db.Integer, nullable=False)
    scan_number = db.Column(db.Integer, nullable=False)

class DeviceVendor(db.Model):
    __tablename__ = 'device_vendor'
    mac_address_prefix = db.Column(db.String, primary_key=True)
    vendor_name = db.Column(db.String, nullable=False)