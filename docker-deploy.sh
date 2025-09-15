#!/bin/bash

# IRAC Docker Deployment Script
# Comprehensive Docker deployment and management for IRAC Platform
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
PROJECT_NAME="irac"
COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
LOGS_DIR="$SCRIPT_DIR/logs"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$BACKUP_DIR"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR $(date +'%H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS $(date +'%H:%M:%S')]${NC} $1"
}

# Banner
print_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
██╗██████╗  █████╗  ██████╗    ██████╗  ██████╗  ██████╗██╗  ██╗███████╗██████╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
██║██████╔╝███████║██║         ██║  ██║██║   ██║██║     █████╔╝ █████╗  ██████╔╝
██║██╔══██╗██╔══██║██║         ██║  ██║██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║██║  ██║██║  ██║╚██████╗    ██████╔╝╚██████╔╝╚██████╗██║  ██╗███████╗██║  ██║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ ██╔████╔██║█████╗  ██╔██╗ ██║   ██║
██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║
██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   ██║ ╚═╝ ██║███████╗██║ ╚████║   ██║
╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}IRAC Platform Docker Deployment System${NC}"
    echo -e "${CYAN}Complete containerized deployment solution${NC}"
    echo ""
}

# Help function
show_help() {
    cat << EOF
${GREEN}IRAC Docker Deployment Script${NC}

${YELLOW}USAGE:${NC}
    $0 [COMMAND] [OPTIONS]

${YELLOW}COMMANDS:${NC}
    ${GREEN}deploy${NC}         Deploy IRAC platform (build + start)
    ${GREEN}start${NC}          Start existing containers
    ${GREEN}stop${NC}           Stop all containers
    ${GREEN}restart${NC}        Restart all containers
    ${GREEN}status${NC}         Show containers status
    ${GREEN}logs${NC}           View containers logs
    ${GREEN}build${NC}          Build Docker images
    ${GREEN}pull${NC}           Pull latest base images
    ${GREEN}clean${NC}          Remove containers and images
    ${GREEN}backup${NC}         Backup database and volumes
    ${GREEN}restore${NC}        Restore from backup
    ${GREEN}dev${NC}            Start development environment
    ${GREEN}prod${NC}           Start production environment
    ${GREEN}health${NC}         Check services health
    ${GREEN}shell${NC}          Access container shell
    ${GREEN}update${NC}         Update and redeploy
    ${GREEN}reset${NC}          Complete reset (danger!)

${YELLOW}OPTIONS:${NC}
    -f, --follow        Follow logs output
    -d, --detach        Run in background
    -v, --verbose       Verbose output
    -h, --help          Show this help

${YELLOW}EXAMPLES:${NC}
    $0 deploy           # Deploy full platform
    $0 logs -f          # Follow all logs
    $0 logs backend     # View backend logs only
    $0 shell backend    # Access backend container
    $0 health           # Check all services
    $0 backup           # Backup database
    $0 dev              # Start development mode

${YELLOW}SERVICE URLS:${NC}
    Frontend:  ${CYAN}http://localhost:3000${NC}
    Backend:   ${CYAN}http://localhost:1405${NC}
    MongoDB:   ${CYAN}mongodb://localhost:27017${NC}
    Redis:     ${CYAN}redis://localhost:6379${NC}
EOF
}

# Check prerequisites
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not available"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
}

# Create environment files if missing
setup_environment() {
    log "Setting up environment files..."

    if [[ ! -f ".env.backend" ]]; then
        if [[ -f "back/.env" ]]; then
            cp back/.env .env.backend
            log "Created .env.backend from back/.env"
        else
            cat > .env.backend << EOF
APP_PORT=1405
ENV=production
MONGO_URI=mongodb://mongo:27017/nejat
REDIS_URI=redis://redis:6379
EOF
            log "Created default .env.backend"
        fi
    fi

    if [[ ! -f ".env.frontend" ]]; then
        if [[ -f "front/.env.local" ]]; then
            cp front/.env.local .env.frontend
            log "Created .env.frontend from front/.env.local"
        else
            cat > .env.frontend << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:1405
EOF
            log "Created default .env.frontend"
        fi
    fi

    success "Environment files ready"
}

# Deploy function
deploy() {
    print_banner
    log "Starting IRAC Platform deployment..."

    check_prerequisites
    setup_environment

    log "Building Docker images..."
    docker compose -p "$PROJECT_NAME" build

    log "Starting services..."
    docker compose -p "$PROJECT_NAME" up -d

    log "Waiting for services to initialize..."
    sleep 30

    check_health
    show_urls
    success "IRAC Platform deployed successfully!"
}

# Start services
start() {
    log "Starting IRAC Platform services..."
    check_prerequisites

    docker compose -p "$PROJECT_NAME" up -d
    log "Waiting for services to start..."
    sleep 15

    check_health
    success "Services started successfully!"
}

# Stop services
stop() {
    log "Stopping IRAC Platform services..."
    docker compose -p "$PROJECT_NAME" stop
    success "Services stopped successfully!"
}

# Restart services
restart() {
    log "Restarting IRAC Platform services..."
    docker compose -p "$PROJECT_NAME" restart
    log "Waiting for services to restart..."
    sleep 15

    check_health
    success "Services restarted successfully!"
}

# Show status
show_status() {
    log "IRAC Platform Status:"
    echo ""
    docker compose -p "$PROJECT_NAME" ps
    echo ""

    # Show resource usage
    info "Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose -p "$PROJECT_NAME" ps -q) 2>/dev/null || echo "No containers running"
}

# Show logs
show_logs() {
    local service=$1
    local follow=${2:-false}

    if [[ "$follow" == "true" ]]; then
        if [[ -n "$service" ]]; then
            docker compose -p "$PROJECT_NAME" logs -f "$service"
        else
            docker compose -p "$PROJECT_NAME" logs -f
        fi
    else
        if [[ -n "$service" ]]; then
            docker compose -p "$PROJECT_NAME" logs --tail=100 "$service"
        else
            docker compose -p "$PROJECT_NAME" logs --tail=50
        fi
    fi
}

# Build images
build_images() {
    log "Building IRAC Platform images..."
    check_prerequisites
    setup_environment

    docker compose -p "$PROJECT_NAME" build --no-cache
    success "Images built successfully!"
}

# Pull base images
pull_images() {
    log "Pulling latest base images..."
    docker compose -p "$PROJECT_NAME" pull
    success "Images pulled successfully!"
}

# Clean up
cleanup() {
    warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Cleaning up IRAC Platform..."
        docker compose -p "$PROJECT_NAME" down -v --rmi all --remove-orphans
        docker system prune -f
        success "Cleanup completed!"
    else
        info "Cleanup cancelled"
    fi
}

# Backup
backup() {
    log "Starting backup process..."
    local backup_file="$BACKUP_DIR/irac-backup-$(date +%Y%m%d_%H%M%S).tar.gz"

    # Create backup directory
    local temp_backup="/tmp/irac-backup-$$"
    mkdir -p "$temp_backup"

    # Backup database
    log "Backing up MongoDB..."
    docker compose -p "$PROJECT_NAME" exec -T mongo mongodump --out /tmp/backup
    docker cp $(docker compose -p "$PROJECT_NAME" ps -q mongo):/tmp/backup "$temp_backup/mongodb"

    # Backup volumes
    log "Backing up volumes..."
    docker run --rm -v "${PROJECT_NAME}_mongo_data":/data -v "$temp_backup":/backup alpine tar czf /backup/mongo_data.tar.gz -C /data .
    docker run --rm -v "${PROJECT_NAME}_redis_data":/data -v "$temp_backup":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

    # Backup configuration
    cp -r config "$temp_backup/" 2>/dev/null || true
    cp .env.* "$temp_backup/" 2>/dev/null || true

    # Create final backup archive
    tar czf "$backup_file" -C "$temp_backup" .
    rm -rf "$temp_backup"

    success "Backup created: $backup_file"
}

# Restore
restore() {
    local backup_file=$1

    if [[ -z "$backup_file" ]]; then
        error "Please specify backup file to restore"
        info "Available backups:"
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi

    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    warning "This will restore from backup and overwrite current data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Restoring from backup: $backup_file"

        # Stop services
        docker compose -p "$PROJECT_NAME" down

        # Extract backup
        local temp_restore="/tmp/irac-restore-$$"
        mkdir -p "$temp_restore"
        tar xzf "$backup_file" -C "$temp_restore"

        # Restore volumes
        docker volume rm "${PROJECT_NAME}_mongo_data" "${PROJECT_NAME}_redis_data" 2>/dev/null || true
        docker volume create "${PROJECT_NAME}_mongo_data"
        docker volume create "${PROJECT_NAME}_redis_data"

        docker run --rm -v "${PROJECT_NAME}_mongo_data":/data -v "$temp_restore":/backup alpine tar xzf /backup/mongo_data.tar.gz -C /data
        docker run --rm -v "${PROJECT_NAME}_redis_data":/data -v "$temp_restore":/backup alpine tar xzf /backup/redis_data.tar.gz -C /data

        # Restore configuration
        cp -r "$temp_restore"/config . 2>/dev/null || true
        cp "$temp_restore"/.env.* . 2>/dev/null || true

        rm -rf "$temp_restore"

        # Start services
        start
        success "Restore completed successfully!"
    else
        info "Restore cancelled"
    fi
}

# Development mode
dev_mode() {
    log "Starting IRAC Platform in development mode..."
    check_prerequisites
    setup_environment

    if [[ -f "$DEV_COMPOSE_FILE" ]]; then
        docker compose -f "$DEV_COMPOSE_FILE" -p "${PROJECT_NAME}-dev" up -d
        log "Development environment started"
        info "Frontend: http://frontend.localhost"
        info "Backend: http://api.localhost"
        info "Traefik Dashboard: http://traefik.localhost"
    else
        warning "Development compose file not found, using production mode"
        docker compose -p "$PROJECT_NAME" up -d
    fi
}

# Production mode
prod_mode() {
    log "Starting IRAC Platform in production mode..."
    check_prerequisites
    setup_environment

    export NODE_ENV=production
    export ENV=production

    docker compose -p "$PROJECT_NAME" up -d
    success "Production environment started"
}

# Health check
check_health() {
    log "Checking services health..."

    local healthy_services=0
    local total_services=4

    # Check MongoDB
    if docker compose -p "$PROJECT_NAME" exec -T mongo mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        success "✅ MongoDB is healthy"
        ((healthy_services++))
    else
        error "❌ MongoDB is not responding"
    fi

    # Check Redis
    if docker compose -p "$PROJECT_NAME" exec -T redis redis-cli ping | grep -q "PONG"; then
        success "✅ Redis is healthy"
        ((healthy_services++))
    else
        error "❌ Redis is not responding"
    fi

    # Check Backend
    if curl -s http://localhost:1405 | grep -q "message" 2>/dev/null; then
        success "✅ Backend is healthy"
        ((healthy_services++))
    else
        error "❌ Backend is not responding"
    fi

    # Check Frontend
    if curl -s -I http://localhost:3000 &>/dev/null; then
        success "✅ Frontend is healthy"
        ((healthy_services++))
    else
        error "❌ Frontend is not responding"
    fi

    info "Health Check: $healthy_services/$total_services services healthy"

    if [[ $healthy_services -eq $total_services ]]; then
        success "All services are healthy!"
        return 0
    elif [[ $healthy_services -ge 2 ]]; then
        warning "Some services need attention"
        return 1
    else
        error "Multiple services are unhealthy"
        return 1
    fi
}

# Access container shell
access_shell() {
    local service=$1

    if [[ -z "$service" ]]; then
        error "Please specify service name (backend, frontend, mongo, redis)"
        exit 1
    fi

    log "Accessing $service container shell..."

    case $service in
        "backend")
            docker compose -p "$PROJECT_NAME" exec backend sh
            ;;
        "frontend")
            docker compose -p "$PROJECT_NAME" exec frontend sh
            ;;
        "mongo")
            docker compose -p "$PROJECT_NAME" exec mongo mongosh
            ;;
        "redis")
            docker compose -p "$PROJECT_NAME" exec redis redis-cli
            ;;
        *)
            docker compose -p "$PROJECT_NAME" exec "$service" sh
            ;;
    esac
}

# Update deployment
update() {
    log "Updating IRAC Platform..."

    # Pull latest code (if in git repo)
    if [[ -d ".git" ]]; then
        log "Pulling latest code..."
        git pull
    fi

    # Backup before update
    backup

    # Pull latest images
    pull_images

    # Rebuild and restart
    build_images
    restart

    success "Update completed!"
}

# Reset everything
reset() {
    warning "This will completely reset the IRAC Platform!"
    warning "All data, containers, images, and volumes will be removed!"
    read -p "Are you absolutely sure? Type 'RESET' to confirm: " confirmation

    if [[ "$confirmation" == "RESET" ]]; then
        log "Resetting IRAC Platform..."

        # Stop and remove everything
        docker compose -p "$PROJECT_NAME" down -v --rmi all --remove-orphans

        # Remove project volumes
        docker volume rm "${PROJECT_NAME}_mongo_data" "${PROJECT_NAME}_redis_data" 2>/dev/null || true

        # Clean up
        docker system prune -af

        success "Reset completed! Run 'deploy' to start fresh."
    else
        info "Reset cancelled"
    fi
}

# Show URLs
show_urls() {
    echo ""
    info "🌐 IRAC Platform URLs:"
    echo -e "   Frontend:  ${CYAN}http://localhost:3000${NC}"
    echo -e "   Backend:   ${CYAN}http://localhost:1405${NC}"
    echo -e "   API Docs:  ${CYAN}http://localhost:1405/playground${NC}"
    echo -e "   MongoDB:   ${CYAN}mongodb://localhost:27017${NC}"
    echo -e "   Redis:     ${CYAN}redis://localhost:6379${NC}"
    echo ""
}

# Main execution
main() {
    case "${1:-help}" in
        "deploy")
            deploy
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "status")
            show_status
            ;;
        "logs")
            local service="${2:-}"
            local follow=false
            [[ "${3:-}" == "-f" || "${3:-}" == "--follow" ]] && follow=true
            show_logs "$service" "$follow"
            ;;
        "build")
            build_images
            ;;
        "pull")
            pull_images
            ;;
        "clean")
            cleanup
            ;;
        "backup")
            backup
            ;;
        "restore")
            restore "${2:-}"
            ;;
        "dev")
            dev_mode
            ;;
        "prod")
            prod_mode
            ;;
        "health")
            check_health
            ;;
        "shell")
            access_shell "${2:-}"
            ;;
        "update")
            update
            ;;
        "reset")
            reset
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
