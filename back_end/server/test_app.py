import pytest
from app import create_app
from app.models import db, User

# Fixture to create a test client and initialize an in-memory database
@pytest.fixture
def client():
    app, _ = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()  # Set up database schema
        yield client  # Provide the test client to the test functions

# Helper function to register a new user
def register_user(client):
    return client.post("/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPass123"
    })

# Helper function to register and then log in a user
def login_user(client):
    register_user(client)
    return client.post("/login", json={
        "email": "test@example.com",
        "password": "TestPass123"
    })

# Test user registration endpoint
def test_register(client):
    res = register_user(client)
    try:
        assert res.status_code == 200
        assert "access_token" in res.json
    except AssertionError:
        raise

# Test login endpoint
def test_login(client):
    res = login_user(client)
    try:
        assert res.status_code == 200
        assert "access_token" in res.json
    except AssertionError:
        raise

# Test access to a protected route with valid token
def test_protected(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["email"] == "test@example.com"
    except AssertionError:
        raise

# Test fetching all users
def test_get_users(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert type(res.json) is list
    except AssertionError:
        raise

# Test adding a device
def test_add_device(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.post("/add_device", headers={"Authorization": f"Bearer {token}"},
                      json={
                          "mac_address": "00:11:22:33:44:55",
                          "device_name": "Test Device",
                          "date_added": "2025-04-01",
                          "email": "test@example.com"
                      })
    try:
        assert res.status_code == 201
    except AssertionError:
        raise

# Test getting list of devices
def test_get_devices(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/devices", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
    except AssertionError:
        raise

# Test getting logs
def test_get_logs(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/logs", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
    except AssertionError:
        raise

# Test deleting a specific device by MAC address
def test_delete_device(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]
    
    # Add a device before deleting
    client.post("/add_device", headers={"Authorization": f"Bearer {token}"},
                json={
                    "mac_address": "00:11:22:33:44:55",
                    "device_name": "ToDelete Device",
                    "date_added": "2025-04-01",
                    "email": "test@example.com"
                })

    # Attempt to delete the added device
    res = client.delete("/delete_device/00:11:22:33:44:55", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["message"] == "Device deleted successfully"
    except AssertionError:
        raise

# Test deleting a user
def test_delete_user(client):
    login_res = login_user(client)
    token = login_res.json["access_token"]

    # Retrieve user by email
    users_res = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    users = users_res.json
    user = next((u for u in users if u["email"] == "test@example.com"), None)

    if not user:
        return

    user_id = user["uid"]

    # Attempt to delete the user
    res = client.delete(f"/delete_user/{user_id}", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["message"] == "User deleted successfully"
    except AssertionError:
        raise
