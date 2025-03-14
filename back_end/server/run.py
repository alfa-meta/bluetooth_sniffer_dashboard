import threading
from app import create_app

app, socketio = create_app()

def run_flask_app():
    # Runs the plain Flask server (for non-socket endpoints) on port 5000
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)

def run_socketio_server():
    # Runs the SocketIO server on port 5001
    socketio.run(app, host="127.0.0.1", port=5001, debug=True, use_reloader=False)

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask_app)
    socketio_thread = threading.Thread(target=run_socketio_server)

    flask_thread.start()
    socketio_thread.start()

    flask_thread.join()
    socketio_thread.join()
