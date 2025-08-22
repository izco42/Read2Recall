import subprocess
import json

def run_lms_command(args: list[str]) -> str:
    result = subprocess.run(["lms"] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Error: {result.stderr}")
    return result.stdout

def start_server(): 
    run_lms_command(["server", "start"])
    return "Server started successfull" 

def stop_server():
    run_lms_command(["server", "stop"])
    return "Server stopped successfully"

def list_models(json_output=True):
    args = ["ls"]
    if json_output:
        args.append("--json")
    output = run_lms_command(args)
    return json.loads(output) if json_output else output

def list_loaded_models():
    output = run_lms_command(["ps", "--json"])
    return json.loads(output)

def load_model(path: str):
    run_lms_command(["load", path, "-y"])
    return f"The model {path} was loaded successfully"

def unload_all():
    run_lms_command(["unload", "--all"])
    return "All models unloaded successfully"
