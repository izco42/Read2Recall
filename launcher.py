import os
import subprocess
import venv
import platform
import signal
import sys
import time

LMS_DIR = os.path.join(os.getcwd(), "lms")
VENV_DIR = os.path.join(LMS_DIR, ".venv")
IS_WINDOWS = platform.system() == "Windows"

PYTHON_PATH = os.path.join(VENV_DIR, "Scripts" if IS_WINDOWS else "bin", "python")
PIP_PATH = os.path.join(VENV_DIR, "Scripts" if IS_WINDOWS else "bin", "pip")

uvicorn_process = None

def launch_docker():
    print("🚀  Running Docker Compose...")
    subprocess.run(["docker","compose", "up","-d", "--build"], check=True)

def create_virtualenv():
    if not os.path.exists(PYTHON_PATH):
        print("🧪 Creating virtualenv for LMS ...")
        venv.create(VENV_DIR, with_pip=True)

def install_dependencies():
    print("📦 Installing LMS dependencies...")
    subprocess.run(
        [PIP_PATH, "install", "-r", os.path.join(LMS_DIR, "requirements.txt")],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

def run_lms_microservice():
    global uvicorn_process
    print("🧠 Running LMS service...")
    uvicorn_process = subprocess.Popen([
        PYTHON_PATH, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1", "--port", "5678"
    ], cwd=LMS_DIR,stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def shutdown():
    print("\n🧹 Stopping services...")

    if uvicorn_process and uvicorn_process.poll() is None:
        print("🔻 Shutting down LMS service ...")
        uvicorn_process.terminate()
        try:
            uvicorn_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            uvicorn_process.kill()

    print("🔻 Shutting down docker containers...")
    subprocess.run(["docker","compose","stop"], check=False)

    sys.exit(0)

def signal_handler(signum , frame)-> None:
    shutdown()

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        launch_docker()
        create_virtualenv()
        install_dependencies()
        run_lms_microservice()

        print("🟢 Everything is running, press ctrl+c to shut down.")

        while True:
            time.sleep(1)

    except Exception as e:
        print(f"❌ Error: {e}")
        shutdown()
    

