#!/usr/bin/env python3
"""
Fennec Launcher - Cross-platform Python script
Converts the original bash script to work on both Linux and Windows
"""

import os
import sys
import time
import signal
import subprocess
import platform
import shutil
from pathlib import Path
import socket
import requests
from contextlib import closing

class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    MAGENTA = '\033[0;35m'
    NC = '\033[0m'  
    
    @staticmethod
    def init_colors():
        if platform.system() == "Windows":
            try:
                import colorama
                colorama.init()
            except ImportError:
                Colors.GREEN = Colors.YELLOW = Colors.RED = ''
                Colors.BLUE = Colors.CYAN = Colors.MAGENTA = Colors.NC = ''

def print_status(message):
    print(f"{Colors.BLUE}[i]{Colors.NC} {message}")

def print_success(message):
    print(f"{Colors.GREEN}[✔]{Colors.NC} {message}")

def print_warning(message):
    print(f"{Colors.YELLOW}[!]{Colors.NC} {message}")

def print_error(message):
    print(f"{Colors.RED}[✘]{Colors.NC} {message}")

def check_command(command):
    """Check if a command is available in the system PATH"""
    if shutil.which(command):
        try:
            result = subprocess.run([command, '--version'], 
                                  capture_output=True, text=True, timeout=5)
            version = result.stdout.split('\n')[0] if result.stdout else "version unknown"
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            version = "version unknown"
        
        print_success(f"{command} found ({version})")
        return True
    else:
        print_error(f"{command} is not installed. Please install it first.")
        return False

def check_port(port):
    """Check if a port is available"""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        if sock.connect_ex(('localhost', port)) == 0:
            print_error(f"Port {port} is already in use. Please free the port and try again.")
            return False
        return True

def wait_for_service(service_name, url, max_attempts=30):
    """Wait for a service to become available"""
    print_status(f"Waiting for {service_name} to become available...")
    
    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(url, timeout=1)
            if response.status_code < 400:
                print_success(f"{service_name} is now available at {url}")
                return True
        except (requests.RequestException, requests.Timeout):
            pass
        
        time.sleep(1)
    
    print_error(f"{service_name} failed to start within {max_attempts} seconds")
    return False

def check_openrouter():
    """Check OpenRouter API setup with user confirmation"""
    print_status("Checking OpenRouter API setup...")
    
    while True:
        response = input(f"{Colors.YELLOW}Have you set up Meta LLaMA 4 Maverick via OpenRouter? (Y/N){Colors.NC} ").strip().lower()
        
        if response in ['y', 'yes']:
            print_success("OpenRouter setup confirmed")
            return True
        elif response in ['n', 'no']:
            print_error("Please set up Meta LLaMA 4 Maverick via OpenRouter first and come back when ready.")
            sys.exit(1)
        else:
            print(f"{Colors.YELLOW}Please answer Y or N.{Colors.NC}")

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if platform.system() == 'Windows' else 'clear')

def print_banner():
    """Print the Fennec ASCII banner"""
    banner = f"""{Colors.CYAN}
  ███████╗███████╗███╗   ██╗███╗   ██╗███████╗ ██████╗
  ██╔════╝██╔════╝████╗  ██║████╗  ██║██╔════╝██╔════╝
  █████╗  █████╗  ██╔██╗ ██║██╔██╗ ██║█████╗  ██║     
  ██╔══╝  ██╔══╝  ██║╚██╗██║██║╚██╗██║██╔══╝  ██║     
  ██║     ███████╗██║ ╚████║██║ ╚████║███████╗╚██████╗
  ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝
{Colors.NC}"""
    print(banner)

def get_python_executable():
    """Get the appropriate Python executable name"""
    if shutil.which('python3'):
        return 'python3'
    elif shutil.which('python'):
        return 'python'
    else:
        print_error("Python not found in PATH")
        return None

def get_venv_activation():
    """Get the virtual environment activation command"""
    if platform.system() == "Windows":
        return os.path.join("backend-venv", "Scripts", "activate")
    else:
        return os.path.join("backend-venv", "bin", "activate")

def run_in_venv(command, cwd=None):
    """Run a command in the virtual environment"""
    if platform.system() == "Windows":
        venv_python = os.path.join("backend-venv", "Scripts", "python.exe")
        venv_pip = os.path.join("backend-venv", "Scripts", "pip.exe")
    else:
        venv_python = os.path.join("backend-venv", "bin", "python")
        venv_pip = os.path.join("backend-venv", "bin", "pip")
    
    if command.startswith('pip '):
        command = command.replace('pip ', f'{venv_pip} ', 1)
    elif command.startswith('python '):
        command = command.replace('python ', f'{venv_python} ', 1)
    elif command.startswith('uvicorn '):
        if platform.system() == "Windows":
            uvicorn_exe = os.path.join("backend-venv", "Scripts", "uvicorn.exe")
        else:
            uvicorn_exe = os.path.join("backend-venv", "bin", "uvicorn")
        command = command.replace('uvicorn ', f'{uvicorn_exe} ', 1)
    
    return subprocess.run(command, shell=True, cwd=cwd, 
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def setup_backend():
    """Set up and start the backend"""
    print_status("Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print_error("Backend directory not found!")
        return None, None
    
    os.chdir(backend_dir)
    
    db_file = Path("database.db")
    if db_file.exists():
        print_warning("Removing existing database.db...")
        db_file.unlink()
        print_success("Database file removed")
    
    venv_dir = Path("backend-venv")
    python_exe = get_python_executable()
    if not python_exe:
        return None, None
        
    if not venv_dir.exists():
        print_warning("Creating Python virtual environment...")
        result = subprocess.run([python_exe, '-m', 'venv', 'backend-venv'], 
                              capture_output=True)
        if result.returncode != 0:
            print_error("Failed to create virtual environment")
            return None, None
    
    print_warning("Installing backend dependencies...")
    pip_upgrade = run_in_venv("pip install --upgrade pip")
    pip_install = run_in_venv("pip install -r requirements.txt")
    
    if pip_upgrade.returncode != 0 or pip_install.returncode != 0:
        print_error("Failed to install backend dependencies")
        return None, None
    
    print_success("Backend dependencies installed")
    
    print_status("Starting FastAPI backend...")
    backend_process = subprocess.Popen([
        os.path.join("backend-venv", "Scripts" if platform.system() == "Windows" else "bin", "uvicorn"),
        "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    os.chdir("..")
    return backend_process, backend_dir

def setup_frontend():
    """Set up and start the frontend"""
    print_status("Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print_error("Frontend directory not found!")
        return None, None
    
    os.chdir(frontend_dir)
    
    node_modules = Path("node_modules")
    if not node_modules.exists():
        print_warning("Installing frontend dependencies...")
        result = subprocess.run(["npm", "install"], 
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if result.returncode != 0:
            print_error("Failed to install frontend dependencies")
            return None, None
        print_success("Frontend dependencies installed")
    
    print_status("Starting React frontend...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"],
                                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    os.chdir("..")
    return frontend_process, frontend_dir

def cleanup_processes(backend_process, frontend_process):
    """Clean up processes on exit"""
    print_warning("\nStopping Fennec...")
    
    processes_to_kill = []
    if backend_process and backend_process.poll() is None:
        processes_to_kill.append(("Backend", backend_process))
    
    if frontend_process and frontend_process.poll() is None:
        processes_to_kill.append(("Frontend", frontend_process))
    
    for name, process in processes_to_kill:
        try:
            process.terminate()
            try:
                process.wait(timeout=5)
                print_success(f"{name} server stopped")
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
                print_success(f"{name} server force stopped")
        except Exception as e:
            print_error(f"Error stopping {name}: {e}")
    
    print(f"{Colors.GREEN}Fennec has been stopped. Goodbye!{Colors.NC}")

def main():
    """Main function"""
    Colors.init_colors()
    
    original_dir = os.getcwd()
    backend_process = None
    frontend_process = None
    
    def signal_handler(signum, frame):
        os.chdir(original_dir)
        cleanup_processes(backend_process, frontend_process)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    if platform.system() != "Windows":
        signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        clear_screen()
        print_banner()
        
        print_status("Checking prerequisites for Fennec...")
        
        python_exe = get_python_executable()
        if not python_exe or not check_command(python_exe):
            sys.exit(1)
        
        if not check_command("node") or not check_command("npm"):
            sys.exit(1)
        
        if not check_openrouter():
            sys.exit(1)
        
        if not check_port(8000) or not check_port(5173):
            sys.exit(1)
        
        print_success("All prerequisites satisfied.")
        print()
        
        backend_process, backend_dir = setup_backend()
        if not backend_process:
            sys.exit(1)
        
        frontend_process, frontend_dir = setup_frontend()
        if not frontend_process:
            cleanup_processes(backend_process, None)
            sys.exit(1)
        
        if not wait_for_service("Backend", "http://localhost:8000/docs"):
            cleanup_processes(backend_process, frontend_process)
            sys.exit(1)
        
        if not wait_for_service("Frontend", "http://localhost:5173"):
            cleanup_processes(backend_process, frontend_process)
            sys.exit(1)
        
        print()
        print_success("Fennec (FastAPI + React) is now running!")
        print(f"{Colors.CYAN}")
        print(f"  Backend:  {Colors.MAGENTA}http://localhost:8000{Colors.CYAN}")
        print(f"  Frontend: {Colors.MAGENTA}http://localhost:5173{Colors.CYAN}")
        print(f"  API Docs: {Colors.MAGENTA}http://localhost:8000/docs{Colors.CYAN}")
        print(f"{Colors.NC}")
        print(f"{Colors.YELLOW}Press Ctrl+C to stop the servers{Colors.NC}")
        print()
        
        try:
            while True:
                time.sleep(1)
                if backend_process.poll() is not None:
                    print_error("Backend process died unexpectedly")
                    break
                if frontend_process.poll() is not None:
                    print_error("Frontend process died unexpectedly")
                    break
        except KeyboardInterrupt:
            pass
    
    except Exception as e:
        print_error(f"Unexpected error: {e}")
    finally:
        os.chdir(original_dir)
        cleanup_processes(backend_process, frontend_process)

if __name__ == "__main__":
    main()