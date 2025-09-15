#!/bin/bash

# IRAC Workflow Management Script
# Manages development workflow between local and Docker environments
# Author: IRAC Development Team
# Version: 1.0

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURRENT_MODE_FILE="$SCRIPT_DIR/.current_mode"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Banner
print_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
██╗██████╗  █████╗  ██████╗    ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██╗      ██████╗ ██╗    ██╗
██║██╔══██╗██╔══██╗██╔════╝    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██║     ██╔═══██╗██║    ██║
██║██████╔╝███████║██║         ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██║     ██║   ██║██║ █╗ ██║
██║██╔══██╗██╔══██║██║         ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██║     ██║   ██║██║███╗██║
██║██║  ██║██║  ██║╚██████╗    ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}IRAC Development Workflow Manager${NC}"
    echo -e "${CYAN}Switch between Local and Docker environments${NC}"
    echo ""
}

# Help function
show_help() {
    print_banner
    cat << EOF
${GREEN}IRAC Workflow Management${NC}

${YELLOW}USAGE:${NC}
    $0 [COMMAND]

${YELLOW}COMMANDS:${NC}
    ${GREEN}local${NC}          Switch to local development mode
    ${GREEN}docker${NC}         Switch to Docker containerized mode
    ${GREEN}status${NC}         Show current environment status
    ${GREEN}urls${NC}           Show service URLs for current mode
    ${GREEN}logs${NC}           View logs for current mode
    ${GREEN}restart${NC}        Restart current environment
    ${GREEN}stop${NC}           Stop all services (both modes)
    ${GREEN}reset${NC}          Reset to clean state
    ${GREEN}health${NC}         Check health of current environment
    ${GREEN}mode${NC}           Show current mode only
    ${GREEN}switch${NC}         Interactive mode switcher

${YELLOW}ENVIRONMENTS:${NC}

    ${CYAN}LOCAL MODE:${NC}
    • Frontend:  http://localhost:3000
    • Backend:   http://localhost:1405
    • MongoDB:   Local system MongoDB
    • Redis:     Local system Redis (if available)
    • Pros:      Fast development, direct debugging
    • Use for:   Active development, debugging

    ${CYAN}DOCKER MODE:${NC}
    • Frontend:  http://localhost:3000
    • Backend:   http://localhost:1405
    • MongoDB:   Containerized MongoDB
    • Redis:     Containerized Redis
    • Pros:      Production-like, isolated, consistent
    • Use for:   Testing, deployment simulation

${YELLOW}EXAMPLES:${NC}
    $0 local           # Switch to local development
    $0 docker          # Switch to Docker mode
    $0 status          # Check what's running
    $0 switch          # Interactive mode selection

${YELLOW}NOTES:${NC}
    • Both modes use same ports for consistency
    • Docker mode stops local MongoDB automatically
    • Local mode starts system MongoDB if needed
    • Current mode is remembered across sessions
EOF
}

# Get current mode
get_current_mode() {
    if [[ -f "$CURRENT_MODE_FILE" ]]; then
        cat "$CURRENT_MODE_FILE"
    else
        echo "none"
    fi
}

# Set current mode
set_current_mode() {
    echo "$1" > "$CURRENT_MODE_FILE"
}

# Check if MongoDB is running locally
is_local_mongo_running() {
    sudo systemctl is-active mongod &>/dev/null || pgrep -f mongod &>/dev/null
}

# Check if Docker containers are running
is_docker_running() {
    docker compose ps -q &>/dev/null && [[ $(docker compose ps -q | wc -l) -gt 0 ]]
}

# Switch to local mode
switch_to_local() {
    log "Switching to LOCAL development mode..."

    # Stop Docker containers if running
    if is_docker_running; then
        log "Stopping Docker containers..."
        docker compose down
    fi

    # Start local MongoDB if not running
    if ! is_local_mongo_running; then
        log "Starting local MongoDB..."
        sudo systemctl start mongod
        sleep 3
    fi

    # Start IRAC services
    log "Starting IRAC local services..."
    if [[ -x "./launch-irac.sh" ]]; then
        ./launch-irac.sh start
    else
        error "launch-irac.sh not found or not executable"
        return 1
    fi

    # Set mode
    set_current_mode "local"

    success "Switched to LOCAL mode successfully!"
    show_urls
}

# Switch to Docker mode
switch_to_docker() {
    log "Switching to DOCKER containerized mode..."

    # Stop local IRAC services
    if [[ -x "./launch-irac.sh" ]]; then
        ./launch-irac.sh stop 2>/dev/null || true
    fi

    # Stop local MongoDB if running
    if is_local_mongo_running; then
        log "Stopping local MongoDB..."
        sudo systemctl stop mongod
        sleep 2
    fi

    # Start Docker containers
    log "Starting Docker containers..."
    docker compose up -d

    # Set mode
    set_current_mode "docker"

    success "Switched to DOCKER mode successfully!"
    log "Waiting for services to initialize..."
    sleep 15
    show_urls
}

# Show current status
show_status() {
    local current_mode=$(get_current_mode)

    echo ""
    info "🔍 IRAC Environment Status"
    echo "=========================="
    echo ""

    case $current_mode in
        "local")
            echo -e "${GREEN}Current Mode: LOCAL Development${NC}"
            echo ""

            # Check local services
            if is_local_mongo_running; then
                echo -e "✅ MongoDB: ${GREEN}Running${NC} (Local)"
            else
                echo -e "❌ MongoDB: ${RED}Stopped${NC} (Local)"
            fi

            # Check IRAC services
            if pgrep -f "deno.*main.ts" > /dev/null; then
                echo -e "✅ Backend: ${GREEN}Running${NC} (PID: $(pgrep -f "deno.*main.ts"))"
            else
                echo -e "❌ Backend: ${RED}Stopped${NC}"
            fi

            if pgrep -f "next" > /dev/null; then
                echo -e "✅ Frontend: ${GREEN}Running${NC} (PID: $(pgrep -f "next"))"
            else
                echo -e "❌ Frontend: ${RED}Stopped${NC}"
            fi
            ;;

        "docker")
            echo -e "${CYAN}Current Mode: DOCKER Containerized${NC}"
            echo ""

            if is_docker_running; then
                docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
            else
                echo -e "❌ ${RED}Docker containers not running${NC}"
            fi
            ;;

        *)
            echo -e "${YELLOW}Current Mode: Not Set${NC}"
            echo ""
            warning "No active environment detected"
            info "Use 'workflow.sh local' or 'workflow.sh docker' to start"
            ;;
    esac
    echo ""
}

# Show URLs for current mode
show_urls() {
    local current_mode=$(get_current_mode)

    echo ""
    info "🌐 Service URLs:"
    case $current_mode in
        "local"|"docker")
            echo -e "   Frontend:  ${CYAN}http://localhost:3000${NC}"
            echo -e "   Backend:   ${CYAN}http://localhost:1405${NC}"
            echo -e "   API Docs:  ${CYAN}http://localhost:1405/playground${NC}"
            echo -e "   MongoDB:   ${CYAN}mongodb://localhost:27017${NC}"
            echo -e "   Redis:     ${CYAN}redis://localhost:6379${NC}"
            ;;
        *)
            warning "No active environment - start local or docker mode first"
            ;;
    esac
    echo ""
}

# Show logs for current mode
show_logs() {
    local current_mode=$(get_current_mode)
    local follow=${1:-false}

    case $current_mode in
        "local")
            if [[ -x "./launch-irac.sh" ]]; then
                if [[ "$follow" == "true" ]]; then
                    info "Following local logs (Ctrl+C to stop)..."
                    tail -f logs/backend.log logs/frontend.log 2>/dev/null || echo "Logs not available"
                else
                    info "Recent local logs:"
                    echo "=== Backend Logs ==="
                    tail -20 logs/backend.log 2>/dev/null || echo "Backend logs not found"
                    echo "=== Frontend Logs ==="
                    tail -20 logs/frontend.log 2>/dev/null || echo "Frontend logs not found"
                fi
            else
                error "Local services not available"
            fi
            ;;
        "docker")
            if [[ "$follow" == "true" ]]; then
                info "Following Docker logs (Ctrl+C to stop)..."
                docker compose logs -f
            else
                info "Recent Docker logs:"
                docker compose logs --tail=20
            fi
            ;;
        *)
            warning "No active environment"
            ;;
    esac
}

# Restart current environment
restart_current() {
    local current_mode=$(get_current_mode)

    case $current_mode in
        "local")
            log "Restarting local environment..."
            if [[ -x "./launch-irac.sh" ]]; then
                ./launch-irac.sh restart
            fi
            ;;
        "docker")
            log "Restarting Docker environment..."
            docker compose restart
            ;;
        *)
            warning "No active environment to restart"
            return 1
            ;;
    esac

    success "Environment restarted successfully!"
}

# Stop all services
stop_all() {
    log "Stopping all IRAC services..."

    # Stop local services
    if [[ -x "./launch-irac.sh" ]]; then
        ./launch-irac.sh stop 2>/dev/null || true
    fi

    # Stop Docker containers
    docker compose down 2>/dev/null || true

    # Note: We don't stop system MongoDB as other applications might use it

    set_current_mode "none"
    success "All services stopped"
}

# Reset to clean state
reset_environment() {
    warning "This will stop all services and reset to clean state"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Resetting environment..."

        stop_all

        # Clean Docker volumes (optional)
        read -p "Also remove Docker volumes (database data)? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v 2>/dev/null || true
            success "Docker volumes removed"
        fi

        rm -f "$CURRENT_MODE_FILE"
        success "Environment reset complete"
    else
        info "Reset cancelled"
    fi
}

# Health check for current environment
health_check() {
    local current_mode=$(get_current_mode)
    local healthy=0
    local total=2

    info "🏥 Health Check - $current_mode mode"
    echo ""

    # Test backend
    if curl -s http://localhost:1405 | grep -q "message" 2>/dev/null; then
        echo -e "✅ Backend: ${GREEN}Healthy${NC}"
        ((healthy++))
    else
        echo -e "❌ Backend: ${RED}Unhealthy${NC}"
    fi

    # Test frontend
    if curl -s -I http://localhost:3000 &>/dev/null; then
        echo -e "✅ Frontend: ${GREEN}Healthy${NC}"
        ((healthy++))
    else
        echo -e "❌ Frontend: ${RED}Unhealthy${NC}"
    fi

    echo ""
    if [[ $healthy -eq $total ]]; then
        success "All services healthy! ($healthy/$total)"
        return 0
    else
        warning "Some services need attention ($healthy/$total)"
        return 1
    fi
}

# Interactive mode switcher
interactive_switch() {
    print_banner

    local current_mode=$(get_current_mode)
    echo -e "Current mode: ${YELLOW}$current_mode${NC}"
    echo ""

    echo "Select environment:"
    echo "1) Local Development"
    echo "2) Docker Containerized"
    echo "3) Show Status"
    echo "4) Exit"
    echo ""

    read -p "Choose option (1-4): " -n 1 -r choice
    echo ""

    case $choice in
        1)
            switch_to_local
            ;;
        2)
            switch_to_docker
            ;;
        3)
            show_status
            ;;
        4)
            info "Goodbye!"
            exit 0
            ;;
        *)
            error "Invalid option"
            exit 1
            ;;
    esac
}

# Main function
main() {
    case "${1:-help}" in
        "local")
            switch_to_local
            ;;
        "docker")
            switch_to_docker
            ;;
        "status")
            show_status
            ;;
        "urls")
            show_urls
            ;;
        "logs")
            show_logs "${2:-false}"
            ;;
        "restart")
            restart_current
            ;;
        "stop")
            stop_all
            ;;
        "reset")
            reset_environment
            ;;
        "health")
            health_check
            ;;
        "mode")
            echo $(get_current_mode)
            ;;
        "switch")
            interactive_switch
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Unknown command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        error "Docker is required but not installed"
        exit 1
    fi

    if ! command -v sudo &> /dev/null; then
        error "sudo is required for MongoDB management"
        exit 1
    fi
}

# Run main function
check_prerequisites
main "$@"
