import os

class Config:
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_dir = os.path.join(basedir, "outputs")
    db_path = os.path.join(db_dir, "devices.db")

    # Ensure directory exists
    os.makedirs(db_dir, exist_ok=True)

    SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    PASSWORD_SALT = os.getenv("PASSWORD_SALT")
