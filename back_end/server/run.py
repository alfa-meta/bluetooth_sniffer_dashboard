import eventlet
eventlet.monkey_patch()

from app import create_app
app, socketio = create_app()

def run_server(port):
    socketio.run(app, host="127.0.0.1", port=port, debug=True)

if __name__ == '__main__':
    from multiprocessing import Process
    p1 = Process(target=run_server, args=(5000,))
    p2 = Process(target=run_server, args=(5001,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
