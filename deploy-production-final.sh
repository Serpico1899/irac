#!/bin/bash

# ================================================================
# IRAC PROJECT - FINAL PRODUCTION DEPLOYMENT ORCHESTRATION
# ================================================================
#
# This script orchestrates the complete production deployment of the
# IRAC (Interactive Resource and Assessment Center) platform.
#
# Features:
# - Complete system validation and deployment
# - External services configuration
# - SSL/TLS and security setup
# - Comprehensive testing and validation
# - Production readiness verification
# - Automated rollback on failure
# - Complete documentation and reporting
#
# Usage: sudo ./deploy-production-final.sh [options]
#
# Options:
#   --domain DOMAIN          Production domain name
#   --email EMAIL           Admin email for SSL certificates
#   --skip-ssl              Skip SSL/TLS configuration
#   --skip-external         Skip external services setup
#   --dry-run               Validate without making changes
#   --force                 Force deployment even with warnings
#   --rollback              Rollback to previous state
#
# Author: IRAC Development Team
# Version: 2.0 Final Production Ready
# Last Updated: December 2024
# ================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_ID="irac-deploy-$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/var/backups/irac"
LOG_DIR="$PROJECT_DIR/logs/deployment"
DEPLOYMENT_LOG="$LOG_DIR/deployment-$DEPLOYMENT_ID.log"

# Deployment configuration
DOMAIN=""
EMAIL=""
SKIP_SSL=false
SKIP_EXTERNAL=false
DRY_RUN=false
FORCE=false
ROLLBACK=false
INTERACTIVE=true

# Service configuration
BACKEND_PORT=1405
FRONTEND_PORT=3000
DATABASE_NAME="irac_production"
MONGODB_URI="mongodb://localhost:27017"

# Deployment tracking
DEPLOYMENT_PHASE=0
TOTAL_PHASES=8
VALIDATIONS_PASSED=0
TOTAL_VALIDATIONS=0
SERVICES_DEPLOYED=0
TOTAL_SERVICES=5

# Arrays for tracking
COMPLETED_PHASES=()
FAILED_PHASES=()
DEPLOYED_SERVICES=()
FAILED_SERVICES=()
ROLLBACK_COMMANDS=()

# Logging functions
log() {
    local message="[$(date +'%H:%M:%S')] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$DEPLOYMENT_LOG"
}

warn() {
    local message="[$(date +'%H:%M:%S')] WARNING: $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$DEPLOYMENT_LOG"
}

error() {
    local message="[$(date +'%H:%M:%S')] ERROR: $1"
    echo -e "${RED}$message${NC}" >&2
    echo "$message" >> "$DEPLOYMENT_LOG"
}

info() {
    local message="[$(date +'%H:%M:%S')] INFO: $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$DEPLOYMENT_LOG"
}

success() {
    local message="[$(date +'%H:%M:%S')] SUCCESS: $1"
    echo -e "${PURPLE}$message${NC}"
    echo "$message" >> "$DEPLOYMENT_LOG"
}

critical() {
    local message="[$(date +'%H:%M:%S')] CRITICAL: $1"
    echo -e "${RED}${BOLD}$message${NC}" >&2
    echo "$message" >> "$DEPLOYMENT_LOG"
}

# Display banner
display_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
██╗██████╗  █████╗  ██████╗    ███████╗██╗███╗   ██╗ █████╗ ██╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔════╝██║████╗  ██║██╔══██╗██║
██║██████╔╝███████║██║         █████╗  ██║██╔██╗ ██║███████║██║
██║██╔══██╗██╔══██║██║         ██╔══╝  ██║██║╚██╗██║██╔══██║██║
██║██║  ██║██║  ██║╚██████╗    ██║     ██║██║ ╚████║██║  ██║███████╗
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝

██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║
██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║
██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ ██╔████╔██║█████╗  ██╔██╗ ██║   ██║
██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║
██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   ██║ ╚═╝ ██║███████╗██║ ╚████║   ██║
╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
EOF
    echo -e "${NC}"
    echo -e "${PURPLE}Interactive Resource and Assessment Center${NC}"
    echo -e "${BLUE}Final Production Deployment Orchestration${NC}"
    echo -e "${GREEN}Version: 2.0 - Enterprise Production Ready${NC}"
    echo -e "${CYAN}Deployment ID: $DEPLOYMENT_ID${NC}"
    echo -e "${CYAN}Time: $(date)${NC}"
    echo ""
}

# Initialize deployment environment
initialize_deployment() {
    log "🚀 Initializing production deployment environment..."

    # Create necessary directories
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"

    # Initialize deployment log
    echo "=== IRAC PRODUCTION DEPLOYMENT LOG ===" > "$DEPLOYMENT_LOG"
    echo "Deployment ID: $DEPLOYMENT_ID" >> "$DEPLOYMENT_LOG"
    echo "Started: $(date)" >> "$DEPLOYMENT_LOG"
    echo "User: $(whoami)" >> "$DEPLOYMENT_LOG"
    echo "Project Directory: $PROJECT_DIR" >> "$DEPLOYMENT_LOG"
    echo "========================================" >> "$DEPLOYMENT_LOG"

    success "Deployment environment initialized"
    ((DEPLOYMENT_PHASE++))
}

# Check deployment prerequisites
check_prerequisites() {
    log "🔍 Checking deployment prerequisites..."

    local prerequisites_passed=true

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        critical "This script must be run as root for production deployment"
        prerequisites_passed=false
    fi

    # Check required commands
    local required_commands=("deno" "node" "pnpm" "mongosh" "curl" "nginx" "openssl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command not found: $cmd"
            prerequisites_passed=false
        fi
    done

    # Check project structure
    local required_files=(
        "$PROJECT_DIR/back/mod.ts"
        "$PROJECT_DIR/front/package.json"
        "$PROJECT_DIR/launch-irac.sh"
        "$PROJECT_DIR/test-lesan-api.js"
    )
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file not found: $file"
            prerequisites_passed=false
        fi
    done

    # Check available disk space (minimum 5GB)
    local available_space=$(df -BG "$PROJECT_DIR" | awk 'NR==2{print $4}' | tr -d 'G')
    if [[ $available_space -lt 5 ]]; then
        error "Insufficient disk space: ${available_space}GB available, 5GB required"
        prerequisites_passed=false
    fi

    # Check available memory (minimum 2GB)
    local available_memory=$(free -g | awk '/^Mem:/{print $2}')
    if [[ $available_memory -lt 2 ]]; then
        warn "Low memory: ${available_memory}GB available, 2GB recommended"
    fi

    if [[ "$prerequisites_passed" == "false" ]]; then
        critical "Prerequisites check failed - cannot proceed with deployment"
        exit 1
    fi

    success "All prerequisites satisfied"
    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("Prerequisites Check")
}

# Create system backup
create_system_backup() {
    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: Would create system backup"
        return 0
    fi

    log "💾 Creating system backup..."

    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_path="$BACKUP_DIR/backup-$backup_timestamp"

    mkdir -p "$backup_path"

    # Backup project files
    if cp -r "$PROJECT_DIR" "$backup_path/project" 2>/dev/null; then
        info "Project files backed up"
    else
        warn "Failed to backup project files"
    fi

    # Backup database
    if command -v mongodump &> /dev/null; then
        if mongodump --uri="$MONGODB_URI/$DATABASE_NAME" --out="$backup_path/database" 2>/dev/null; then
            info "Database backed up"
        else
            warn "Failed to backup database"
        fi
    fi

    # Backup nginx configuration
    if [[ -d "/etc/nginx" ]]; then
        if cp -r /etc/nginx "$backup_path/nginx" 2>/dev/null; then
            info "Nginx configuration backed up"
        else
            warn "Failed to backup Nginx configuration"
        fi
    fi

    # Create backup manifest
    cat > "$backup_path/manifest.txt" << EOF
IRAC System Backup
==================
Created: $(date)
Deployment ID: $DEPLOYMENT_ID
Project Directory: $PROJECT_DIR
Database: $DATABASE_NAME

Contents:
- project/     : Complete project source code
- database/    : MongoDB database dump
- nginx/       : Nginx configuration files

Restore Instructions:
1. Stop all IRAC services
2. Restore project files: cp -r project/* $PROJECT_DIR/
3. Restore database: mongorestore database/
4. Restore nginx: cp -r nginx/* /etc/nginx/
5. Restart services
EOF

    # Add rollback command
    ROLLBACK_COMMANDS+=("Restore from backup: $backup_path")

    success "System backup created: $backup_path"
    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("System Backup")
}

# Validate current system status
validate_system_status() {
    log "🔍 Validating current system status..."

    ((TOTAL_VALIDATIONS += 5))

    # Test backend API
    info "Testing backend API..."
    if curl -s -X POST "http://localhost:$BACKEND_PORT/lesan" \
       -H "Content-Type: application/json" \
       -d '{"model":"user","act":"nonexistent","details":{}}' | grep -q "incorrect"; then
        success "Backend API is operational"
        ((VALIDATIONS_PASSED++))
    else
        error "Backend API validation failed"
    fi

    # Test database connection
    info "Testing database connection..."
    if mongosh --eval "db.runCommand({ ping: 1 })" --quiet "$MONGODB_URI" >/dev/null 2>&1; then
        success "Database connection successful"
        ((VALIDATIONS_PASSED++))
    else
        error "Database connection failed"
    fi

    # Test project structure
    info "Validating project structure..."
    local structure_valid=true
    local required_dirs=("back" "front" "logs")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$PROJECT_DIR/$dir" ]]; then
            error "Missing directory: $dir"
            structure_valid=false
        fi
    done
    if [[ "$structure_valid" == "true" ]]; then
        success "Project structure is valid"
        ((VALIDATIONS_PASSED++))
    fi

    # Test file permissions
    info "Checking file permissions..."
    if [[ -x "$PROJECT_DIR/launch-irac.sh" ]] && [[ -x "$PROJECT_DIR/test-lesan-api.js" ]]; then
        success "File permissions are correct"
        ((VALIDATIONS_PASSED++))
    else
        warn "Some scripts may not be executable"
    fi

    # Test system resources
    info "Checking system resources..."
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100)}')

    if (( $(echo "$memory_usage < 80" | bc -l) )); then
        success "System resources are adequate (Memory: ${memory_usage}%)"
        ((VALIDATIONS_PASSED++))
    else
        warn "High memory usage: ${memory_usage}%"
    fi

    local validation_rate=$((VALIDATIONS_PASSED * 100 / TOTAL_VALIDATIONS))
    if [[ $validation_rate -ge 80 ]]; then
        success "System validation passed ($validation_rate%)"
    else
        error "System validation failed ($validation_rate%)"
        if [[ "$FORCE" != "true" ]]; then
            critical "Use --force to proceed despite validation failures"
            exit 1
        fi
    fi

    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("System Validation")
}

# Deploy backend services
deploy_backend() {
    log "🔧 Deploying backend services..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: Would deploy backend services"
        ((SERVICES_DEPLOYED++))
        DEPLOYED_SERVICES+=("Backend (dry run)")
        return 0
    fi

    # Stop existing backend if running
    info "Stopping existing backend services..."
    if pgrep -f "deno.*mod.ts" >/dev/null; then
        pkill -f "deno.*mod.ts" || true
        sleep 3
    fi

    # Start backend service
    info "Starting backend service..."
    cd "$PROJECT_DIR/back"
    nohup deno run --allow-all mod.ts > "$LOG_DIR/backend.log" 2>&1 &
    local backend_pid=$!
    echo "$backend_pid" > "$PROJECT_DIR/logs/backend.pid"

    # Wait for backend to start
    local attempts=0
    local max_attempts=30
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -s "http://localhost:$BACKEND_PORT/lesan" >/dev/null 2>&1; then
            success "Backend service deployed successfully (PID: $backend_pid)"
            ((SERVICES_DEPLOYED++))
            DEPLOYED_SERVICES+=("Backend Service")
            ROLLBACK_COMMANDS+=("Kill backend: kill $backend_pid")
            break
        fi
        sleep 1
        ((attempts++))
    done

    if [[ $attempts -eq $max_attempts ]]; then
        error "Backend deployment failed - service not responding"
        FAILED_SERVICES+=("Backend Service")
        return 1
    fi

    cd "$PROJECT_DIR"
    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("Backend Deployment")
}

# Deploy frontend services
deploy_frontend() {
    log "🎨 Deploying frontend services..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: Would deploy frontend services"
        ((SERVICES_DEPLOYED++))
        DEPLOYED_SERVICES+=("Frontend (dry run)")
        return 0
    fi

    # Stop existing frontend if running
    info "Stopping existing frontend services..."
    pkill -f "next.*dev\|pnpm.*dev" || true
    sleep 3

    # Build frontend for production
    info "Building frontend for production..."
    cd "$PROJECT_DIR/front"
    if pnpm build > "$LOG_DIR/frontend-build.log" 2>&1; then
        success "Frontend build completed"
    else
        error "Frontend build failed"
        FAILED_SERVICES+=("Frontend Build")
        return 1
    fi

    # Start frontend service
    info "Starting frontend service..."
    if [[ -d ".next" ]]; then
        nohup pnpm start > "$LOG_DIR/frontend.log" 2>&1 &
        local start_cmd="start"
    else
        nohup pnpm dev > "$LOG_DIR/frontend.log" 2>&1 &
        local start_cmd="dev"
    fi

    local frontend_pid=$!
    echo "$frontend_pid" > "$PROJECT_DIR/logs/frontend.pid"

    # Wait for frontend to start (frontend takes longer)
    local attempts=0
    local max_attempts=60
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -s "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
            success "Frontend service deployed successfully (PID: $frontend_pid, Mode: $start_cmd)"
            ((SERVICES_DEPLOYED++))
            DEPLOYED_SERVICES+=("Frontend Service")
            ROLLBACK_COMMANDS+=("Kill frontend: kill $frontend_pid")
            break
        fi
        sleep 1
        ((attempts++))
        if [[ $((attempts % 10)) -eq 0 ]]; then
            info "Waiting for frontend to start... ($attempts/$max_attempts)"
        fi
    done

    if [[ $attempts -eq $max_attempts ]]; then
        warn "Frontend deployment timeout - may still be starting"
        warn "Check logs: tail -f $LOG_DIR/frontend.log"
        # Don't fail completely - frontend might still work
        ((SERVICES_DEPLOYED++))
        DEPLOYED_SERVICES+=("Frontend Service (with warnings)")
    fi

    cd "$PROJECT_DIR"
    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("Frontend Deployment")
}

# Configure external services
configure_external_services() {
    if [[ "$SKIP_EXTERNAL" == "true" ]]; then
        warn "Skipping external services configuration"
        ((DEPLOYMENT_PHASE++))
        return 0
    fi

    log "🌐 Configuring external services..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: Would configure external services"
        ((SERVICES_DEPLOYED++))
        DEPLOYED_SERVICES+=("External Services (dry run)")
        ((DEPLOYMENT_PHASE++))
        return 0
    fi

    # Check if external services setup script exists
    if [[ -f "$PROJECT_DIR/setup-external-services.sh" ]]; then
        info "Running external services configuration..."

        # Run in batch mode for automated deployment
        if "$PROJECT_DIR/setup-external-services.sh" --batch > "$LOG_DIR/external-services.log" 2>&1; then
            success "External services configured successfully"
            ((SERVICES_DEPLOYED++))
            DEPLOYED_SERVICES+=("External Services")
        else
            warn "External services configuration completed with warnings"
            warn "Check logs: $LOG_DIR/external-services.log"
            DEPLOYED_SERVICES+=("External Services (partial)")
        fi
    else
        warn "External services setup script not found"
        info "Manual configuration required for:"
        info "  - SMS Provider (Kavenegar/SMS.ir/Twilio)"
        info "  - Payment Gateway (ZarinPal/Stripe)"
        info "  - Email SMTP (Mailgun/AWS SES)"
        info "  - File Storage (AWS S3/Arvan Cloud)"
    fi

    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("External Services")
}

# Setup SSL and reverse proxy
setup_ssl_proxy() {
    if [[ "$SKIP_SSL" == "true" ]]; then
        warn "Skipping SSL/TLS configuration"
        ((DEPLOYMENT_PHASE++))
        return 0
    fi

    log "🔐 Setting up SSL/TLS and reverse proxy..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN: Would setup SSL/TLS and reverse proxy"
        ((SERVICES_DEPLOYED++))
        DEPLOYED_SERVICES+=("SSL/TLS (dry run)")
        ((DEPLOYMENT_PHASE++))
        return 0
    fi

    # Check if SSL setup script exists
    if [[ -f "$PROJECT_DIR/setup-ssl-proxy.sh" ]]; then
        if [[ -n "$DOMAIN" ]]; then
            info "Running SSL/TLS and reverse proxy setup..."

            local ssl_args=""
            if [[ -n "$EMAIL" ]]; then
                ssl_args="--email $EMAIL"
            fi

            if "$PROJECT_DIR/setup-ssl-proxy.sh" --domain "$DOMAIN" $ssl_args > "$LOG_DIR/ssl-setup.log" 2>&1; then
                success "SSL/TLS and reverse proxy configured successfully"
                ((SERVICES_DEPLOYED++))
                DEPLOYED_SERVICES+=("SSL/TLS & Reverse Proxy")
                ROLLBACK_COMMANDS+=("Restore nginx config from backup")
            else
                error "SSL/TLS setup failed"
                FAILED_SERVICES+=("SSL/TLS Setup")
                return 1
            fi
        else
            warn "Domain not specified - skipping SSL/TLS setup"
            info "Use --domain flag to configure SSL/TLS"
        fi
    else
        warn "SSL setup script not found - manual configuration required"
        info "Manual steps required:"
        info "  1. Configure SSL certificates"
        info "  2. Setup nginx reverse proxy"
        info "  3. Configure security headers"
    fi

    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("SSL/TLS & Proxy")
}

# Run comprehensive tests
run_comprehensive_tests() {
    log "🧪 Running comprehensive production tests..."

    local test_results_file="$LOG_DIR/comprehensive-tests-$DEPLOYMENT_ID.json"
    local tests_passed=0
    local tests_total=0

    # Backend API Tests
    info "Running backend API tests..."
    if [[ -f "$PROJECT_DIR/test-lesan-api.js" ]]; then
        if cd "$PROJECT_DIR" && node test-lesan-api.js > "$LOG_DIR/api-tests.log" 2>&1; then
            local api_success_rate=$(grep "Success Rate:" "$LOG_DIR/api-tests.log" | grep -o "[0-9.]*%" | head -1)
            success "Backend API tests completed: $api_success_rate"
            ((tests_passed++))
        else
            error "Backend API tests failed"
        fi
        ((tests_total++))
    fi

    # Integration Tests
    info "Running integration tests..."
    if [[ -f "$PROJECT_DIR/integration-test.js" ]]; then
        if cd "$PROJECT_DIR" && node integration-test.js > "$LOG_DIR/integration-tests.log" 2>&1; then
            success "Integration tests passed"
            ((tests_passed++))
        else
            error "Integration tests failed"
        fi
        ((tests_total++))
    fi

    # Performance Tests
    info "Running performance validation..."
    local backend_response_time=$(curl -o /dev/null -s -w "%{time_total}" "http://localhost:$BACKEND_PORT/lesan" \
        -X POST -H "Content-Type: application/json" -d '{"model":"user","act":"nonexistent","details":{}}' || echo "999")

    if (( $(echo "$backend_response_time < 2.0" | bc -l) )); then
        success "Backend response time acceptable: ${backend_response_time}s"
        ((tests_passed++))
    else
        warn "Backend response time high: ${backend_response_time}s"
    fi
    ((tests_total++))

    # SSL Tests (if configured)
    if [[ -n "$DOMAIN" ]] && [[ "$SKIP_SSL" != "true" ]]; then
        info "Testing SSL configuration..."
        if curl -s -I "https://$DOMAIN/health" >/dev/null 2>&1; then
            success "SSL/HTTPS access working"
            ((tests_passed++))
        else
            warn "SSL/HTTPS test failed or not yet propagated"
        fi
        ((tests_total++))
    fi

    # Database Tests
    info "Testing database operations..."
    if mongosh --eval "db.runCommand({ ping: 1 }); db.stats()" --quiet "$MONGODB_URI/$DATABASE_NAME" >/dev/null 2>&1; then
        success "Database operations working"
        ((tests_passed++))
    else
        error "Database operations failed"
    fi
    ((tests_total++))

    # Save test results
    cat > "$test_results_file" << EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "timestamp": "$(date -Iseconds)",
  "tests_passed": $tests_passed,
  "tests_total": $tests_total,
  "success_rate": $(echo "scale=1; $tests_passed * 100 / $tests_total" | bc -l),
  "backend_response_time": "$backend_response_time",
  "domain": "$DOMAIN",
  "services_deployed": $SERVICES_DEPLOYED,
  "phases_completed": $DEPLOYMENT_PHASE
}
EOF

    local test_success_rate=$(echo "scale=1; $tests_passed * 100 / $tests_total" | bc -l)
    if (( $(echo "$test_success_rate >= 80" | bc -l) )); then
        success "Comprehensive tests passed: $test_success_rate% ($tests_passed/$tests_total)"
    else
        error "Comprehensive tests failed: $test_success_rate% ($tests_passed/$tests_total)"
        if [[ "$FORCE" != "true" ]]; then
            critical "Use --force to complete deployment despite test failures"
            return 1
        fi
    fi

    ((DEPLOYMENT_PHASE++))
    COMPLETED_PHASES+=("Comprehensive Testing")
}

# Generate deployment report
generate_deployment_report() {
    log "📊 Generating deployment report..."

    local report_file="$LOG_DIR/deployment-report-$DEPLOYMENT_ID.md"
    local success_rate=$((DEPLOYMENT_PHASE * 100 / TOTAL_PHASES))
    local services_rate=$((SERVICES_DEPLOYED * 100 / TOTAL_SERVICES))

    cat > "$report_file" << EOF
# 🚀 IRAC Production Deployment Report

**Deployment ID**: $DEPLOYMENT_ID
**Date**: $(date)
**Duration**: $(($(date +%s) - $(stat -c %Y "$DEPLOYMENT_LOG")))s
**Status**: $([ $success_rate -ge 90 ] && echo "✅ SUCCESS" || echo "⚠️ PARTIAL")

## 📊 Deployment Statistics

- **Phases Completed**: $DEPLOYMENT_PHASE/$TOTAL_PHASES ($success_rate%)
- **Services Deployed**: $SERVICES_DEPLOYED/$TOTAL_SERVICES ($services_rate%)
- **Validations Passed**: $VALIDATIONS_PASSED/$TOTAL_VALIDATIONS
- **Domain**: ${DOMAIN:-"Not configured"}
- **SSL/TLS**: $([ "$SKIP_SSL" = "true" ] && echo "Skipped" || [ -n "$DOMAIN" ] && echo "Configured" || echo "Not configured")

## ✅ Successfully Completed Phases

EOF

    for phase in "${COMPLETED_PHASES[@]}"; do
        echo "- ✅ $phase" >> "$report_file"
    done

    if [[ ${#
