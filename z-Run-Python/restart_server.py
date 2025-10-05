import os
import sys
import time

def start_server():
    try:
        os.system("python -m http.server")
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    while True:
        print("Starting server...")
        start_server()
        print("Restarting server in 3 seconds...")
        time.sleep(3)
