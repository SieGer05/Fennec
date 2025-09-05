#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✔]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✘]${NC} $1"
}

check_command() {
    if command -v "$1" > /dev/null 2>&1; then
        local version
        version=$($1 --version 2>/dev/null | head -n1 || echo "version unknown")
        print_success "$1 found ($version)"
        return 0
    else
        print_error "$1 is not installed. Please install it first."
        return 1
    fi
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port $1 is already in use. Please free the port and try again."
        return 1
    fi
    return 0
}

wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service to become available..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service is now available at $url"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start within $max_attempts seconds"
    return 1
}

check_openrouter() {
    print_status "Checking OpenRouter API setup..."
    
    while true; do
        echo -e "${YELLOW}Have you set up Meta LLaMA 4 Maverick via OpenRouter? (Y/N)${NC}"
        read -r response
        
        case $response in
            [Yy]* )
                print_success "OpenRouter setup confirmed"
                return 0
                ;;
            [Nn]* )
                print_error "Please set up Meta LLaMA 4 Maverick via OpenRouter first and come back when ready."
                exit 1
                ;;
            * )
                echo -e "${YELLOW}Please answer Y or N.${NC}"
                ;;
        esac
    done
}

clear
echo -e "${CYAN}"
cat << "EOF"
  ███████╗███████╗███╗   ██╗███╗   ██╗███████╗ ██████╗
  ██╔════╝██╔════╝████╗  ██║████╗  ██║██╔════╝██╔════╝
  █████╗  █████╗  ██╔██╗ ██║██╔██╗ ██║█████╗  ██║     
  ██╔══╝  ██╔══╝  ██║╚██╗██║██║╚██╗██║██╔══╝  ██║     
  ██║     ███████╗██║ ╚████║██║ ╚████║███████╗╚██████╗
  ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝
EOF
echo -e "${NC}"

### Prerequisites Check ###
print_status "Checking prerequisites for Fennec..."

check_command python3 || exit 1
check_command node || exit 1
check_command npm || exit 1
check_openrouter || exit 1

check_port 8000 || exit 1
check_port 5173 || exit 1

print_success "All prerequisites satisfied."
echo

### Backend Setup ###
print_status "Setting up backend..."
cd backend

if [ -f "database.db" ]; then
    print_warning "Removing existing database.db..."
    rm -f database.db
    print_success "Database file removed"
fi

if [ ! -d "backend-venv" ]; then
    print_warning "Creating Python virtual environment..."
    python3 -m venv backend-venv
fi

source backend-venv/bin/activate

print_warning "Installing backend dependencies..."
if pip install --upgrade pip > /dev/null 2>&1 && pip install -r requirements.txt > /dev/null 2>&1; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_status "Starting FastAPI backend..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 >/dev/null 2>&1 &
BACKEND_PID=$!

cd ..

### Frontend Setup ###
print_status "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    if npm install > /dev/null 2>&1; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
fi

print_status "Starting React frontend..."
npm run dev >/dev/null 2>&1 &
FRONTEND_PID=$!

cd ..

wait_for_service "Backend" "http://localhost:8000/docs"
wait_for_service "Frontend" "http://localhost:5173"

echo
print_success "Fennec (FastAPI + React) is now running!"
echo -e "${CYAN}"
echo -e "  Backend:  ${MAGENTA}http://localhost:8000${CYAN}"
echo -e "  Frontend: ${MAGENTA}http://localhost:5173${CYAN}"
echo -e "  API Docs: ${MAGENTA}http://localhost:8000/docs${CYAN}"
echo -e "${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"
echo

cleanup() {
    if [ -n "${CLEANUP_DONE:-}" ]; then
        return
    fi
    CLEANUP_DONE=1
    
    echo
    print_warning "Stopping Fennec..."
    
    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        pkill -P "$BACKEND_PID" 2>/dev/null || true
        kill "$BACKEND_PID" 2>/dev/null || true

        sleep 1

        kill -9 "$BACKEND_PID" 2>/dev/null || true
        print_success "Backend server stopped"
    fi
    
    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        pkill -P "$FRONTEND_PID" 2>/dev/null || true
        kill "$FRONTEND_PID" 2>/dev/null || true

        sleep 1

        kill -9 "$FRONTEND_PID" 2>/dev/null || true
        print_success "Frontend server stopped"
    fi
    
    pkill -f "uvicorn.*app.main:app" 2>/dev/null || true
    
    pkill -f "vite" 2>/dev/null || true
    
    if [ -n "${VIRTUAL_ENV:-}" ]; then
        deactivate 2>/dev/null || true
        print_success "Virtual environment deactivated"
    fi
    
    echo -e "${GREEN}Fennec has been stopped. Goodbye!${NC}"
}

trap cleanup INT TERM EXIT

while true; do
    sleep 1
done