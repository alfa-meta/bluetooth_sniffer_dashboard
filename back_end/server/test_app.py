import pytest
from app import create_app
from app.models import db, User

@pytest.fixture
def client():
    app, _ = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def register_user(client):
    return client.post("/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPass123"
    })

def login_user(client):
    register_user(client)
    return client.post("/login", json={
        "email": "test@example.com",
        "password": "TestPass123"
    })

def test_register(client):
    print("Running test_register...")
    res = register_user(client)
    try:
        assert res.status_code == 200
        assert "access_token" in res.json
        print("✅ test_register successful")
    except AssertionError:
        print("❌ test_register failed")
        raise

def test_login(client):
    print("Running test_login...")
    res = login_user(client)
    try:
        assert res.status_code == 200
        assert "access_token" in res.json
        print("✅ test_login successful")
    except AssertionError:
        print("❌ test_login failed")
        raise

def test_protected(client):
    print("Running test_protected...")
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["email"] == "test@example.com"
        print("✅ test_protected successful")
    except AssertionError:
        print("❌ test_protected failed")
        raise

def test_get_users(client):
    print("Running test_get_users...")
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert type(res.json) is list
        print("✅ test_get_users successful")
    except AssertionError:
        print("❌ test_get_users failed")
        raise

def test_add_device(client):
    print("Running test_add_device...")
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
        print("✅ test_add_device successful")
    except AssertionError:
        print("❌ test_add_device failed")
        raise

def test_get_devices(client):
    print("Running test_get_devices...")
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/devices", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        print("✅ test_get_devices successful")
    except AssertionError:
        print("❌ test_get_devices failed")
        raise

def test_get_logs(client):
    print("Running test_get_logs...")
    login_res = login_user(client)
    token = login_res.json["access_token"]
    res = client.get("/logs", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        print("✅ test_get_logs successful")
    except AssertionError:
        print("❌ test_get_logs failed")
        raise

def test_delete_device(client):
    print("Running test_delete_device...")
    login_res = login_user(client)
    token = login_res.json["access_token"]
    
    # First add a device
    client.post("/add_device", headers={"Authorization": f"Bearer {token}"},
                json={
                    "mac_address": "00:11:22:33:44:55",
                    "device_name": "ToDelete Device",
                    "date_added": "2025-04-01",
                    "email": "test@example.com"
                })

    # Delete the device
    res = client.delete("/delete_device/00:11:22:33:44:55", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["message"] == "Device deleted successfully"
        print("✅ test_delete_device successful")
    except AssertionError:
        print("❌ test_delete_device failed")
        raise

def test_delete_user(client):
    print("Running test_delete_user...")
    login_res = login_user(client)
    token = login_res.json["access_token"]

    # Get user with specific email
    users_res = client.get("/users", headers={"Authorization": f"Bearer {token}"})
    users = users_res.json
    user = next((u for u in users if u["email"] == "test@example.com"), None)

    if not user:
        print("❌ User with email test@example.com not found")
        return

    user_id = user["uid"]

    # Delete user
    res = client.delete(f"/delete_user/{user_id}", headers={"Authorization": f"Bearer {token}"})
    try:
        assert res.status_code == 200
        assert res.json["message"] == "User deleted successfully"
        print("✅ test_delete_user successful")
    except AssertionError:
        print("❌ test_delete_user failed")
        raise
