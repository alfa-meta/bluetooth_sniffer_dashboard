from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'USER'
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    devices = db.relationship('Device', backref='user', lazy=True)

class Device(db.Model):
    __tablename__ = 'device'
    mac_address = db.Column(db.String, primary_key=True)
    device_name = db.Column(db.String, nullable=False)
    last_seen = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String, db.ForeignKey('USER.email'), nullable=False)

class Logs(db.Model):
    __tablename__ = 'logs'
    mac_address = db.Column(db.String, primary_key=True)
    first_seen = db.Column(db.Integer, nullable=False)
    last_seen = db.Column(db.Integer, nullable=False)
    count = db.Column(db.Integer, nullable=False)
    scan_number = db.Column(db.Integer, nullable=False)

# class Statistics(db.Model):
#     __tablename__ = 'statistics'
#     date = db.Column(db.Integer, primary_key=True)

