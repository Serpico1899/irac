#!/bin/bash

# ================================================================
# IRAC PROJECT - SSL/TLS & REVERSE PROXY SETUP SCRIPT
# ================================================================
#
# This script automates the setup of SSL/TLS certificates and
# reverse proxy configuration for IRAC production deployment.
#
# Features:
# - Let's Encrypt SSL certificate installation
# - Custom SSL certificate support
# - Nginx reverse proxy configuration
# - Security headers and HTTPS enforcement
# - Automatic certificate renewal
# - Domain validation and DNS checks
#
# Usage: ./setup-ssl-proxy.sh [--domain yourdomain.com] [--email admin@yourdomain.com]
#
# Author: IRAC Development Team
# Version: 1.0 Production Ready
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
BACKEND_PORT=${BACKEND_PORT:-1405}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONFIG_DIR="/etc/nginx"
SSL_DIR="/etc/ssl/irac"
CERTBOT_DIR="/etc/letsencrypt/live"

# Default configuration
DOMAIN=""
EMAIL=""
USE_LETS_ENCRYPT=true
CUSTOM_CERT_PATH=""
CUSTOM_KEY_PATH=""
SETUP_FIREWALL=true
ENABLE_HSTS=true
ENABLE_OCSP=true
INTERACTIVE_MODE=true

# Service tracking
STEPS_COMPLETED=0
STEPS_TOTAL=8
VALIDATIONS_PASSED=0
VALIDATIONS_TOTAL=5

# Arrays for tracking
COMPLETED_STEPS=()
FAILED_STEPS=()
VALIDATION_RESULTS=()

# Logging functions
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

critical() {
    echo -e "${RED}${BOLD}[$(date +'%H:%M:%S')] CRITICAL: $1${NC}" >&2
}

# Display banner
display_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
███████╗███████╗██╗         ████████╗██╗     ███████╗
██╔════╝██╔════╝██║         ╚══██╔══╝██║     ██╔════╝
███████╗███████╗██║            ██║   ██║     ███████╗
╚════██║╚════██║██║            ██║   ██║     ╚════██║
███████║███████║███████╗       ██║   ███████╗███████║
╚══════╝╚══════╝╚══════╝       ╚═╝   ╚══════╝╚══════╝

██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝
██████╔╝██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝
██╔═══╝ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝
██║     ██║  ██║╚██████╔╝██╔╝ ██╗   ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝

███████╗███████╗████████╗██╗   ██╗██████╗
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
███████╗█████╗     ██║   ██║   ██║██████╔╝
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
███████║███████╗   ██║   ╚██████╔╝██║
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝
EOF
    echo -e "${NC}"
    echo -e "${PURPLE}IRAC SSL/TLS & Reverse Proxy Setup${NC}"
    echo -e "${BLUE}Production Security & Performance Configuration${NC}"
    echo -e "${GREEN}Version: 1.0 - Enterprise Security${NC}"
    echo -e "${CYAN}Time: $(date)${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        critical "This script must be run as root for SSL and nginx configuration"
        error "Please run with sudo: sudo $0 $*"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."

    # Check required commands
    local required_commands=("nginx" "openssl" "curl" "dig")
    local missing_commands=()

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done

    # Install missing packages
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        warn "Installing missing packages: ${missing_commands[*]}"

        if command -v apt-get &> /dev/null; then
            apt-get update
            for cmd in "${missing_commands[@]}"; do
                case "$cmd" in
                    "nginx") apt-get install -y nginx ;;
                    "openssl") apt-get install -y openssl ;;
                    "curl") apt-get install -y curl ;;
                    "dig") apt-get install -y dnsutils ;;
                esac
            done
        elif command -v yum &> /dev/null; then
            for cmd in "${missing_commands[@]}"; do
                case "$cmd" in
                    "nginx") yum install -y nginx ;;
                    "openssl") yum install -y openssl ;;
                    "curl") yum install -y curl ;;
                    "dig") yum install -y bind-utils ;;
                esac
            done
        else
            critical "Package manager not supported. Please install manually: ${missing_commands[*]}"
            exit 1
        fi
    fi

    # Check if certbot is available (for Let's Encrypt)
    if [[ "$USE_LETS_ENCRYPT" == "true" ]] && ! command -v certbot &> /dev/null; then
        warn "Installing certbot for Let's Encrypt..."
        if command -v snap &> /dev/null; then
            snap install --classic certbot
            ln -sf /snap/bin/certbot /usr/bin/certbot
        elif command -v apt-get &> /dev/null; then
            apt-get install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            yum install -y certbot python3-certbot-nginx
        else
            error "Could not install certbot automatically"
            exit 1
        fi
    fi

    # Create SSL directory
    mkdir -p "$SSL_DIR"

    success "Prerequisites check completed"
    COMPLETED_STEPS+=("Prerequisites check")
    ((STEPS_COMPLETED++))
}

# Validate domain configuration
validate_domain() {
    log "🌐 Validating domain configuration..."

    if [[ -z "$DOMAIN" ]]; then
        if [[ "$INTERACTIVE_MODE" == "true" ]]; then
            echo -ne "${CYAN}Enter your domain name (e.g., yourdomain.com): ${NC}"
            read DOMAIN
        else
            error "Domain not specified. Use --domain flag or interactive mode."
            exit 1
        fi
    fi

    if [[ -z "$EMAIL" ]]; then
        if [[ "$INTERACTIVE_MODE" == "true" ]]; then
            echo -ne "${CYAN}Enter your email for SSL certificates: ${NC}"
            read EMAIL
        else
            EMAIL="admin@$DOMAIN"
            warn "Email not specified, using: $EMAIL"
        fi
    fi

    # Validate domain format
    if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        error "Invalid domain format: $DOMAIN"
        exit 1
    fi

    # Check DNS resolution
    info "Checking DNS resolution for $DOMAIN..."
    if dig +short "$DOMAIN" | grep -E '^[0-9.]+$' >/dev/null; then
        local domain_ip=$(dig +short "$DOMAIN" | head -1)
        success "Domain resolves to: $domain_ip"
        ((VALIDATIONS_PASSED++))
    else
        error "Domain $DOMAIN does not resolve to an IP address"
        error "Please configure DNS records before running this script"
        exit 1
    fi
    ((VALIDATIONS_TOTAL++))

    # Check if domain points to this server
    local server_ip=$(curl -s ipinfo.io/ip || curl -s ifconfig.me || echo "unknown")
    if [[ "$server_ip" != "unknown" ]]; then
        local domain_ip=$(dig +short "$DOMAIN" | head -1)
        if [[ "$domain_ip" == "$server_ip" ]]; then
            success "Domain points to this server ($server_ip)"
            ((VALIDATIONS_PASSED++))
        else
            warn "Domain points to $domain_ip but server IP is $server_ip"
            warn "SSL certificate validation may fail"
        fi
    else
        warn "Could not determine server IP address"
    fi
    ((VALIDATIONS_TOTAL++))

    success "Domain validation completed for: $DOMAIN"
    COMPLETED_STEPS+=("Domain validation")
    ((STEPS_COMPLETED++))
}

# Setup firewall rules
setup_firewall() {
    if [[ "$SETUP_FIREWALL" != "true" ]]; then
        warn "Firewall setup skipped"
        return 0
    fi

    log "🔥 Configuring firewall rules..."

    # Configure UFW if available
    if command -v ufw &> /dev/null; then
        info "Configuring UFW firewall..."
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 80/tcp   # HTTP
        ufw allow 443/tcp  # HTTPS
        ufw --force enable
        success "UFW firewall configured"
    # Configure firewalld if available
    elif command -v firewall-cmd &> /dev/null; then
        info "Configuring firewalld..."
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --reload
        success "Firewalld configured"
    # Configure iptables directly
    elif command -v iptables &> /dev/null; then
        info "Configuring iptables..."
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
        iptables -P INPUT DROP

        # Save rules (distribution-specific)
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
            iptables-save > /etc/sysconfig/iptables 2>/dev/null || \
            warn "Could not save iptables rules permanently"
        fi
        success "Iptables configured"
    else
        warn "No supported firewall found - manual configuration required"
    fi

    COMPLETED_STEPS+=("Firewall configuration")
    ((STEPS_COMPLETED++))
}

# Generate SSL certificates
generate_ssl_certificates() {
    log "🔐 Generating SSL certificates..."

    if [[ "$USE_LETS_ENCRYPT" == "true" ]]; then
        info "Using Let's Encrypt for SSL certificates..."

        # Stop nginx if running to avoid port conflicts
        systemctl stop nginx 2>/dev/null || true

        # Generate certificate
        if certbot certonly \
            --standalone \
            --non-interactive \
            --agree-tos \
            --email "$EMAIL" \
            -d "$DOMAIN" \
            -d "www.$DOMAIN"; then

            success "Let's Encrypt certificates generated successfully"

            # Set certificate paths
            SSL_CERT_PATH="$CERTBOT_DIR/$DOMAIN/fullchain.pem"
            SSL_KEY_PATH="$CERTBOT_DIR/$DOMAIN/privkey.pem"
            SSL_CHAIN_PATH="$CERTBOT_DIR/$DOMAIN/chain.pem"

            ((VALIDATIONS_PASSED++))
        else
            error "Failed to generate Let's Encrypt certificates"
            error "Please check domain DNS configuration and try again"
            exit 1
        fi
    else
        info "Using custom SSL certificates..."

        if [[ -n "$CUSTOM_CERT_PATH" ]] && [[ -n "$CUSTOM_KEY_PATH" ]]; then
            if [[ -f "$CUSTOM_CERT_PATH" ]] && [[ -f "$CUSTOM_KEY_PATH" ]]; then
                # Copy custom certificates
                cp "$CUSTOM_CERT_PATH" "$SSL_DIR/cert.pem"
                cp "$CUSTOM_KEY_PATH" "$SSL_DIR/privkey.pem"

                SSL_CERT_PATH="$SSL_DIR/cert.pem"
                SSL_KEY_PATH="$SSL_DIR/privkey.pem"

                success "Custom SSL certificates installed"
                ((VALIDATIONS_PASSED++))
            else
                error "Custom certificate files not found"
                exit 1
            fi
        else
            error "Custom certificate paths not specified"
            exit 1
        fi
    fi
    ((VALIDATIONS_TOTAL++))

    # Validate certificate
    if openssl x509 -in "$SSL_CERT_PATH" -text -noout >/dev/null 2>&1; then
        success "SSL certificate validation passed"
        ((VALIDATIONS_PASSED++))
    else
        error "SSL certificate validation failed"
        exit 1
    fi
    ((VALIDATIONS_TOTAL++))

    COMPLETED_STEPS+=("SSL certificate generation")
    ((STEPS_COMPLETED++))
}

# Configure Nginx
configure_nginx() {
    log "⚙️ Configuring Nginx reverse proxy..."

    # Create nginx configuration
    local nginx_config="$NGINX_SITES_AVAILABLE/irac"

    cat > "$nginx_config" << EOF
# IRAC Production Nginx Configuration
# Auto-generated by setup-ssl-proxy.sh
# Generated: $(date)

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=frontend:10m rate=30r/s;

# Upstream servers
upstream irac_backend {
    server 127.0.0.1:$BACKEND_PORT;
    keepalive 32;
}

upstream irac_frontend {
    server 127.0.0.1:$FRONTEND_PORT;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt challenge path
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other HTTP requests to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate $SSL_CERT_PATH;
    ssl_certificate_key $SSL_KEY_PATH;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
EOF

    if [[ "$ENABLE_OCSP" == "true" ]] && [[ -n "${SSL_CHAIN_PATH:-}" ]]; then
        cat >> "$nginx_config" << EOF
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate $SSL_CHAIN_PATH;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
EOF
    fi

    cat >> "$nginx_config" << EOF

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';" always;
EOF

    if [[ "$ENABLE_HSTS" == "true" ]]; then
        cat >> "$nginx_config" << EOF
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
EOF
    fi

    cat >> "$nginx_config" << EOF

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # API Routes (Backend)
    location /lesan {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://irac_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;

        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # API Playground
    location /playground {
        limit_req zone=api burst=10 nodelay;

        proxy_pass http://irac_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files and uploads
    location /files {
        proxy_pass http://irac_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Caching for static files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js static files
    location /_next/static {
        limit_req zone=frontend burst=50 nodelay;

        proxy_pass http://irac_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Long-term caching for Next.js static assets
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        limit_req zone=frontend burst=20 nodelay;

        proxy_pass http://irac_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        expires 1w;
        add_header Cache-Control "public";
    }

    # Frontend Routes (Next.js)
    location / {
        limit_req zone=frontend burst=50 nodelay;

        proxy_pass http://irac_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;

        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # Handle Next.js routing
        try_files \$uri \$uri/ @frontend;
    }

    # Fallback for Next.js routing
    location @frontend {
        proxy_pass http://irac_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/irac_access.log;
    error_log /var/log/nginx/irac_error.log;
}
EOF

    # Enable the site
    ln -sf "$nginx_config" "$NGINX_SITES_ENABLED/irac"

    # Remove default site if exists
    rm -f "$NGINX_SITES_ENABLED/default"

    # Test nginx configuration
    if nginx -t; then
        success "Nginx configuration is valid"
        ((VALIDATIONS_PASSED++))
    else
        error "Nginx configuration test failed"
        exit 1
    fi
    ((VALIDATIONS_TOTAL++))

    COMPLETED_STEPS+=("Nginx configuration")
    ((STEPS_COMPLETED++))
}

# Start and enable services
start_services() {
    log "🚀 Starting and enabling services..."

    # Enable and start nginx
    systemctl enable nginx
    systemctl restart nginx

    if systemctl is-active nginx >/dev/null; then
        success "Nginx service started successfully"
        ((VALIDATIONS_PASSED++))
    else
        error "Failed to start Nginx service"
        systemctl status nginx --no-pager
        exit 1
    fi
    ((VALIDATIONS_TOTAL++))

    COMPLETED_STEPS+=("Service startup")
    ((STEPS_COMPLETED++))
}

# Setup automatic certificate renewal
setup_certificate_renewal() {
    if [[ "$USE_LETS_ENCRYPT" != "true" ]]; then
        warn "Skipping certificate renewal setup (not using Let's Encrypt)"
        COMPLETED_STEPS+=("Certificate renewal (skipped)")
        ((STEPS_COMPLETED++))
        return 0
    fi

    log "🔄 Setting up automatic certificate renewal..."

    # Create renewal script
    local renewal_script="/usr/local/bin/renew-irac-certs.sh"
    cat > "$renewal_script" << EOF
#!/bin/bash
# IRAC SSL Certificate Renewal Script
# Auto-generated by setup-ssl-proxy.sh

set -euo pipefail

LOG_FILE="/var/log/irac-cert-renewal.log"

{
    echo "=== Certificate Renewal Started: \$(date) ==="

    # Renew certificates
    if certbot renew --quiet; then
        echo "Certificates renewed successfully"

        # Test nginx configuration
        if nginx -t; then
            # Reload nginx
            systemctl reload nginx
            echo "Nginx reloaded successfully"
        else
            echo "ERROR: Nginx configuration test failed"
            exit 1
        fi
    else
        echo "Certificate renewal failed"
        exit 1
    fi

    echo "=== Certificate Renewal Completed: \$(date) ==="
    echo ""
} >> "\$LOG_FILE" 2>&1
EOF

    chmod +x "$renewal_script"

    # Create cron job for automatic renewal
    local cron_job="0 2 * * 0 /usr/local/bin/renew-irac-certs.sh"

    # Add to root's crontab if not already present
    if ! crontab -l 2>/dev/null | grep -q "renew-irac-certs.sh"; then
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        success "Automatic certificate renewal configured (weekly on Sunday at 2 AM)"
    else
        info "Certificate renewal cron job already exists"
    fi

    # Create logrotate configuration
    cat > "/etc/logrotate.d/irac-certs" << EOF
/var/log/irac-cert-renewal.log {
    monthly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

    success "Certificate renewal automation completed"
    COMPLETED_STEPS+=("Certificate renewal automation")
    ((STEPS_COMPLETED++))
}

# Run final validation tests
run_validation_tests() {
    log "🧪 Running final validation tests..."

    # Test HTTP to HTTPS redirect
    info "Testing HTTP to HTTPS redirect..."
    local redirect_test=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/health" || echo "000")
    if [[ "$redirect_test" == "301" ]] || [[ "$redirect_test" == "302" ]]; then
        success "HTTP to HTTPS redirect working"
    else
        warn "HTTP to HTTPS redirect test inconclusive (code: $redirect_test)"
    fi

    # Test HTTPS access
    info "Testing HTTPS access..."
    local https_test=$(curl -s -k -o /dev/null -w "%{http_code}" "https://$DOMAIN/health" || echo "000")
    if [[ "$https_test" == "200" ]]; then
        success "HTTPS access working"
        ((VALIDATIONS_PASSED++))
    else
        error "HTTPS access test failed (code: $https_test)"
    fi

    # Test SSL certificate
    info "Testing SSL certificate..."
    if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | \
       openssl x509 -noout -dates 2>/dev/null; then
        success "SSL certificate is valid and accessible"
        ((VALIDATIONS_PASSED++))
    else
        warn "SSL certificate validation inconclusive"
    fi

    # Test backend API through proxy
    info "Testing backend API through proxy..."
    local api_test=$(curl -s -k "https://$DOMAIN/lesan" -X POST \
        -H "Content-Type: application/json" \
        -d '{"model":"user","act":"nonexistent","details":{}}' | grep -q "incorrect" && echo "200" || echo "000")
    if [[ "$api_test" == "200" ]]; then
        success "Backend API accessible through HTTPS proxy"
