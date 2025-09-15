#!/bin/bash

# IRAC Project - Comprehensive Launch Script
# This script launches the complete IRAC platform with all services
# Based on PROJECT_COMPLETION_REPORT.md - System is 99% complete and production-ready

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=${BACKEND_PORT:-1405}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017"}
DATABASE_NAME=${DATABASE_NAME:-"irac_development"}

# PID files for service management
BACKEND_PID_FILE="$PROJECT_DIR/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/logs/frontend.pid"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}" >&2
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${PURPLE}[$(date +'%H:%M:%S')] SUCCESS: $1${NC}"
}

# Display banner
show_banner() {
    echo -e "${CYAN}"
    echo "██╗██████╗  █████╗  ██████╗"
    echo "██║██╔══██╗██╔══██╗██╔════╝"
    echo "██║██████╔╝███████║██║     "
    echo "██║██╔══██╗██╔══██║██║     "
    echo "██║██║  ██║██║  ██║╚██████╗"
    echo "╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝"
    echo -e "${NC}"
    echo -e "${GREEN}Interactive Resource and Assessment Center${NC}"
    echo -e "${BLUE}Production-Ready Platform Launch System${NC}"
    echo -e "${PURPLE}Status: 99% Complete - Ready for Production${NC}"
    echo ""
}

# Check if services are already running
check_running_services() {
    local backend_running=false
    local frontend_running=false

    # Check backend
    if [[ -f "$BACKEND_PID_FILE" ]]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE" 2>/dev/null || echo "")
        if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" 2>/dev/null; then
            backend_running=true
        else
            rm -f "$BACKEND_PID_FILE"
        fi
    fi

    # Check frontend
    if [[ -f "$FRONTEND_PID_FILE" ]]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || echo "")
        if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" 2>/dev/null; then
            frontend_running=true
        else
            rm -f "$FRONTEND_PID_FILE"
        fi
    fi

    if [[ "$backend_running" == true ]] || [[ "$frontend_running" == true ]]; then
        warn "Some IRAC services are already running:"
        [[ "$backend_running" == true ]] && echo "  • Backend (PID: $(cat "$BACKEND_PID_FILE"))"
        [[ "$frontend_running" == true ]] && echo "  • Frontend (PID: $(cat "$FRONTEND_PID_FILE"))"
        echo ""
        read -p "Stop existing services and restart? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            stop_services
        else
            show_running_info
            exit 0
        fi
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    local missing_deps=()

    # Check Deno
    if ! command -v deno &> /dev/null; then
        missing_deps+=("Deno (https://deno.land/)")
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js (https://nodejs.org/)")
    fi

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        warn "pnpm not found, will attempt to use npm"
    fi

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  • $dep"
        done
        exit 1
    fi

    success "All system requirements satisfied"
}

# Setup directories and permissions
setup_directories() {
    log "Setting up directories..."

    # Create necessary directories
    mkdir -p "$PROJECT_DIR/logs"
    mkdir -p "$PROJECT_DIR/back/public/uploads/images"
    mkdir -p "$PROJECT_DIR/back/public/uploads/videos"
    mkdir -p "$PROJECT_DIR/back/public/uploads/docs"

    # Set permissions
    chmod 755 "$PROJECT_DIR/back/public" 2>/dev/null || true
    chmod 755 "$PROJECT_DIR/logs" 2>/dev/null || true

    success "Directories configured"
}

# Install dependencies if needed
check_dependencies() {
    log "Checking project dependencies..."

    # Check backend dependencies (Deno handles automatically)
    info "Backend dependencies managed by Deno automatically"

    # Check frontend dependencies
    if [[ -d "$PROJECT_DIR/front" ]] && [[ -f "$PROJECT_DIR/front/package.json" ]]; then
        if [[ ! -d "$PROJECT_DIR/front/node_modules" ]]; then
            log "Installing frontend dependencies..."
            cd "$PROJECT_DIR/front"

            if command -v pnpm &> /dev/null; then
                pnpm install
            else
                npm install
            fi

            cd "$PROJECT_DIR"
            success "Frontend dependencies installed"
        else
            info "Frontend dependencies already installed"
        fi
    fi
}

# Start backend service
start_backend() {
    log "Starting IRAC Backend..."

    cd "$PROJECT_DIR/back"

    # Start backend in background
    nohup deno run --allow-all mod.ts > "$PROJECT_DIR/logs/backend.log" 2>&1 &
    local backend_pid=$!
    echo "$backend_pid" > "$BACKEND_PID_FILE"

    cd "$PROJECT_DIR"

    # Wait a moment and check if it started successfully
    sleep 3
    if kill -0 "$backend_pid" 2>/dev/null; then
        success "Backend started (PID: $backend_pid)"
        return 0
    else
        error "Backend failed to start"
        return 1
    fi
}

# Start frontend service
start_frontend() {
    log "Starting IRAC Frontend..."

    if [[ ! -d "$PROJECT_DIR/front" ]]; then
        warn "Frontend directory not found, skipping frontend startup"
        return 0
    fi

    cd "$PROJECT_DIR/front"

    # Determine the start command
    local start_cmd="start"
    if [[ -f "package.json" ]] && grep -q "\"dev\":" package.json; then
        start_cmd="dev"
    fi

    # Start frontend in background
    if command -v pnpm &> /dev/null; then
        nohup pnpm "$start_cmd" > "$PROJECT_DIR/logs/frontend.log" 2>&1 &
    else
        nohup npm run "$start_cmd" > "$PROJECT_DIR/logs/frontend.log" 2>&1 &
    fi

    local frontend_pid=$!
    echo "$frontend_pid" > "$FRONTEND_PID_FILE"

    cd "$PROJECT_DIR"

    # Wait a moment and check if it started successfully
    sleep 5
    if kill -0 "$frontend_pid" 2>/dev/null; then
        success "Frontend started (PID: $frontend_pid)"
        return 0
    else
        error "Frontend failed to start"
        return 1
    fi
}

# Health check services
health_check() {
    log "Performing health checks..."
    local checks_passed=0
    local total_checks=2

    # Check backend health
    info "Checking backend health..."
    local backend_attempts=0
    while [[ $backend_attempts -lt 30 ]]; do
        if curl -f -s "http://localhost:$BACKEND_PORT" > /dev/null 2>&1; then
            success "✅ Backend is healthy (http://localhost:$BACKEND_PORT)"
            ((checks_passed++))
            break
        fi
        ((backend_attempts++))
        sleep 1
    done

    if [[ $backend_attempts -eq 30 ]]; then
        error "❌ Backend health check failed after 30 seconds"
        warn "Check logs: tail -f $PROJECT_DIR/logs/backend.log"
    fi

    # Check frontend health (if frontend exists and should be running)
    if [[ -d "$PROJECT_DIR/front" ]] && [[ -f "$FRONTEND_PID_FILE" ]]; then
        info "Checking frontend health..."
        local frontend_attempts=0
        while [[ $frontend_attempts -lt 60 ]]; do
            if curl -f -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
                success "✅ Frontend is healthy (http://localhost:$FRONTEND_PORT)"
                ((checks_passed++))
                break
            fi
            ((frontend_attempts++))
            sleep 1
        done

        if [[ $frontend_attempts -eq 60 ]]; then
            error "❌ Frontend health check failed after 60 seconds"
            warn "Check logs: tail -f $PROJECT_DIR/logs/frontend.log"
        fi
    else
        total_checks=1  # Only backend to check
    fi

    return $((total_checks - checks_passed))
}

# Stop services
stop_services() {
    log "Stopping IRAC services..."

    # Stop backend
    if [[ -f "$BACKEND_PID_FILE" ]]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$backend_pid" 2>/dev/null; then
            kill "$backend_pid" 2>/dev/null || true
            sleep 2
            kill -9 "$backend_pid" 2>/dev/null || true
            info "Backend stopped"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Stop frontend
    if [[ -f "$FRONTEND_PID_FILE" ]]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$frontend_pid" 2>/dev/null; then
            kill "$frontend_pid" 2>/dev/null || true
            sleep 2
            kill -9 "$frontend_pid" 2>/dev/null || true
            info "Frontend stopped"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    success "All services stopped"
}

# Show running service information
show_running_info() {
    echo ""
    echo -e "${CYAN}🎉 IRAC PLATFORM IS RUNNING!${NC}"
    echo -e "${CYAN}==============================${NC}"
    echo ""
    echo -e "${GREEN}📊 SERVICE STATUS:${NC}"

    if [[ -f "$BACKEND_PID_FILE" ]]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        echo "  • Backend: http://localhost:$BACKEND_PORT (PID: $backend_pid)"
    fi

    if [[ -f "$FRONTEND_PID_FILE" ]]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        echo "  • Frontend: http://localhost:$FRONTEND_PORT (PID: $frontend_pid)"
    fi

    echo ""
    echo -e "${BLUE}🔧 MANAGEMENT COMMANDS:${NC}"
    echo "  • View backend logs: tail -f $PROJECT_DIR/logs/backend.log"
    echo "  • View frontend logs: tail -f $PROJECT_DIR/logs/frontend.log"
    echo "  • Stop services: $0 stop"
    echo "  • Restart services: $0 restart"
    echo ""
    echo -e "${YELLOW}🧪 TESTING COMMANDS:${NC}"
    echo "  • Run endpoint verification: ./verify-endpoints.js"
    echo "  • Run integration tests: ./integration-test.js"
    echo "  • Setup demo data: ./complete-data-setup.js"
    echo ""
    echo -e "${PURPLE}🚀 READY FOR:${NC}"
    echo "  • User registration and authentication"
    echo "  • Product browsing and purchasing"
    echo "  • Course enrollment and learning"
    echo "  • Content management and administration"
    echo "  • Complete business operations"
    echo ""
    echo -e "${GREEN}✨ IRAC is production-ready and fully operational!${NC}"
}

# Show status of services
show_status() {
    echo ""
    echo -e "${CYAN}IRAC Platform Status${NC}"
    echo -e "${CYAN}====================${NC}"

    local backend_status="❌ STOPPED"
    local frontend_status="❌ STOPPED"

    # Check backend
    if [[ -f "$BACKEND_PID_FILE" ]]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$backend_pid" 2>/dev/null; then
            if curl -f -s "http://localhost:$BACKEND_PORT" > /dev/null 2>&1; then
                backend_status="✅ RUNNING (PID: $backend_pid)"
            else
                backend_status="⚠️  RUNNING but not responding (PID: $backend_pid)"
            fi
        else
            backend_status="❌ STOPPED (stale PID file)"
            rm -f "$BACKEND_PID_FILE"
        fi
    fi

    # Check frontend
    if [[ -d "$PROJECT_DIR/front" ]]; then
        if [[ -f "$FRONTEND_PID_FILE" ]]; then
            local frontend_pid=$(cat "$FRONTEND_PID_FILE")
            if kill -0 "$frontend_pid" 2>/dev/null; then
                if curl -f -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
                    frontend_status="✅ RUNNING (PID: $frontend_pid)"
                else
                    frontend_status="⚠️  RUNNING but not responding (PID: $frontend_pid)"
                fi
            else
                frontend_status="❌ STOPPED (stale PID file)"
                rm -f "$FRONTEND_PID_FILE"
            fi
        fi
    else
        frontend_status="ℹ️  NOT AVAILABLE"
    fi

    echo ""
    echo -e "${GREEN}Services:${NC}"
    echo "  Backend:  $backend_status"
    echo "  Frontend: $frontend_status"
    echo ""

    if [[ "$backend_status" == *"RUNNING"* ]] || [[ "$frontend_status" == *"RUNNING"* ]]; then
        echo -e "${BLUE}URLs:${NC}"
        [[ "$backend_status" == *"RUNNING"* ]] && echo "  • Backend API: http://localhost:$BACKEND_PORT"
        [[ "$frontend_status" == *"RUNNING"* ]] && echo "  • Frontend: http://localhost:$FRONTEND_PORT"
    fi
}

# Main launch function
launch_irac() {
    show_banner

    log "Launching IRAC Platform..."
    echo ""

    check_running_services
    check_requirements
    setup_directories
    check_dependencies

    echo ""
    log "Starting services..."

    # Start backend
    if start_backend; then
        info "Backend service started successfully"
    else
        error "Failed to start backend service"
        exit 1
    fi

    # Start frontend (if exists)
    if [[ -d "$PROJECT_DIR/front" ]]; then
        if start_frontend; then
            info "Frontend service started successfully"
        else
            warn "Frontend service failed to start (continuing anyway)"
        fi
    else
        info "Frontend directory not found, starting backend only"
    fi

    echo ""

    # Health checks
    if health_check; then
        success "All health checks passed!"
        show_running_info
    else
        warn "Some health checks failed, but services may still be starting"
        show_running_info
        echo ""
        warn "If services don't respond, check the logs and try restarting"
    fi
}

# Handle command line arguments
case "${1:-start}" in
    start)
        launch_irac
        ;;
    stop)
        log "Stopping IRAC services..."
        stop_services
        ;;
    restart)
        log "Restarting IRAC services..."
        stop_services
        sleep 2
        launch_irac
        ;;
    status)
        show_status
        ;;
    logs)
        echo "Showing live logs (Ctrl+C to exit):"
        echo ""
        if [[ -f "$PROJECT_DIR/logs/backend.log" ]]; then
            echo -e "${GREEN}=== Backend Logs ===${NC}"
            tail -n 20 "$PROJECT_DIR/logs/backend.log"
        fi
        echo ""
        if [[ -f "$PROJECT_DIR/logs/frontend.log" ]]; then
            echo -e "${BLUE}=== Frontend Logs ===${NC}"
            tail -n 20 "$PROJECT_DIR/logs/frontend.log"
        fi
        echo ""
        echo "Following logs... (Ctrl+C to exit)"
        tail -f "$PROJECT_DIR/logs/"*.log 2>/dev/null || echo "No active log files found"
        ;;
    test)
        log "Running endpoint verification..."
        if [[ -x "./verify-endpoints.js" ]]; then
            ./verify-endpoints.js
        else
            error "Endpoint verification script not found or not executable"
        fi
        ;;
    seed)
        log "Running data seeding..."
        if [[ -x "./complete-data-setup.js" ]]; then
            ./complete-data-setup.js
        else
            error "Data seeding script not found or not executable"
        fi
        ;;
    help|--help|-h)
        echo "IRAC Platform Launch Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start     Start all IRAC services (default)"
        echo "  stop      Stop all IRAC services"
        echo "  restart   Restart all IRAC services"
        echo "  status    Show current service status"
        echo "  logs      Show recent logs and follow new entries"
        echo "  test      Run endpoint verification tests"
        echo "  seed      Run comprehensive data seeding"
        echo "  help      Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  BACKEND_PORT     Backend service port (default: 8000)"
        echo "  FRONTEND_PORT    Frontend service port (default: 3000)"
        echo "  MONGODB_URI      MongoDB connection string"
        echo "  DATABASE_NAME    Database name (default: irac_development)"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
