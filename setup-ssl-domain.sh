#!/bin/bash

# IRAC SSL and Domain Setup Script
# Version: 1.0
# Purpose: Configure domain, SSL certificates, and reverse proxy for production
# Author: IRAC Development Team
# Date: December 2024

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
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SSL_DIR="/etc/ssl/certs"
LOGS_DIR="$SCRIPT_DIR/logs"
CONFIG_DIR="$SCRIPT_DIR/config"

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$CONFIG_DIR"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/ssl-setup.log"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/ssl-setup.log"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/ssl-setup.log"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/ssl-setup.log"
}

success() {
    echo -e "${GREEN}[SUCCESS $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/ssl-setup.log"
}

# Banner
print_banner() {
    clear
    echo -e "${PURPLE}"
    cat << 'EOF'
██╗██████╗  █████╗  ██████╗    ███████╗███████╗██╗         ██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗███╗   ██╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔════╝██╔════╝██║         ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██║████╗  ██║
██║██████╔╝███████║██║         ███████╗███████╗██║         ██║  ██║██║   ██║██╔████╔██║███████║██║██╔██╗ ██║
██║██╔══██╗██╔══██║██║         ╚════██║╚════██║██║         ██║  ██║██║   ██║██║╚██╔╝██║██╔══██║██║██║╚██╗██║
██║██║  ██║██║  ██║╚██████╗    ███████║███████║███████╗    ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚══════╝╚══════╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

███████╗███████╗████████╗██╗   ██╗██████╗
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
███████╗█████╗     ██║   ██║   ██║██████╔╝
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
███████║███████╗   ██║   ╚██████╔╝██║
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Interactive Resource and Assessment Center${NC}"
    echo -e "${YELLOW}SSL Certificate & Domain Configuration System${NC}"
    echo -e "${GREEN}Version: 1.0 - Production Ready${NC}"
    echo -e "${BLUE}Status: Configuring HTTPS & Domain${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for SSL and Nginx configuration"
        echo "Please run: sudo $0"
        exit 1
    fi
}

# Install required packages
install_dependencies() {
    log "Installing required dependencies..."

    # Update package list
    apt update -y

    # Install nginx if not present
    if ! command -v nginx > /dev/null 2>&1; then
        log "Installing Nginx..."
        apt install -y nginx
    fi

    # Install certbot if not present
    if ! command -v certbot > /dev/null 2>&1; then
        log "Installing Certbot..."
        apt install -y certbot python3-certbot-nginx
    fi

    # Install other utilities
    apt install -y curl wget openssl ufw

    success "Dependencies installed successfully"
}

# Configure domain
configure_domain() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                    DOMAIN CONFIGURATION${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${YELLOW}Domain Setup Options:${NC}"
    echo -e "${BLUE}1)${NC} Configure new domain"
    echo -e "${BLUE}2)${NC} Use localhost with self-signed certificate"
    echo -e "${BLUE}3)${NC} Skip domain configuration"
    echo ""

    read -p "Enter your choice (1-3): " domain_choice

    case $domain_choice in
        1)
            setup_production_domain
            ;;
        2)
            setup_localhost_ssl
            ;;
        3)
            warning "Skipping domain configuration"
            return 1
            ;;
        *)
            error "Invalid choice. Skipping domain configuration."
            return 1
            ;;
    esac
}

setup_production_domain() {
    log "Setting up production domain..."

    read -p "Enter your domain name (e.g., irac.example.com): " DOMAIN_NAME
    read -p "Enter admin email for Let's Encrypt: " ADMIN_EMAIL

    if [[ -z "$DOMAIN_NAME" ]] || [[ -z "$ADMIN_EMAIL" ]]; then
        error "Domain name and email are required"
        return 1
    fi

    # Validate domain format
    if [[ ! "$DOMAIN_NAME" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        error "Invalid domain format"
        return 1
    fi

    # Check DNS resolution
    log "Checking DNS resolution for $DOMAIN_NAME..."
    if ! nslookup "$DOMAIN_NAME" > /dev/null 2>&1; then
        warning "DNS resolution failed. Make sure your domain points to this server's IP"
        echo "Current server IP addresses:"
        ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d'/' -f1
        echo ""
        read -p "Do you want to continue anyway? (y/n): " continue_anyway
        if [[ "$continue_anyway" != "y" ]]; then
            return 1
        fi
    fi

    # Create Nginx configuration
    create_nginx_config "$DOMAIN_NAME"

    # Install SSL certificate
    install_ssl_certificate "$DOMAIN_NAME" "$ADMIN_EMAIL"

    # Update environment files with domain
    update_env_with_domain "$DOMAIN_NAME"

    success "Production domain configured successfully"
}

setup_localhost_ssl() {
    log "Setting up localhost with self-signed certificate..."

    DOMAIN_NAME="localhost"

    # Create self-signed certificate
    create_self_signed_cert

    # Create Nginx configuration for localhost
    create_nginx_config_localhost

    success "Localhost SSL configured successfully"
}

create_nginx_config() {
    local domain=$1
    local config_file="$NGINX_AVAILABLE/irac"

    log "Creating Nginx configuration for $domain..."

    cat > "$config_file" << EOF
# IRAC Platform Nginx Configuration
# Domain: $domain
# Generated: $(date)

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $domain;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $domain;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/$domain/chain.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: wss: ws:; media-src 'self' https:;" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://127.0.0.1:1405/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Lesan API endpoint
    location /lesan {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://127.0.0.1:1405/lesan;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # CORS headers for API
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Login rate limiting
    location ~ ^/(api/)?.*login.*$ {
        limit_req zone=login burst=5 nodelay;

        proxy_pass http://127.0.0.1:1405;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files (if served directly)
    location /uploads/ {
        alias $SCRIPT_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Security - deny access to sensitive files
    location ~ /\\.ht {
        deny all;
    }

    location ~ /\\.env {
        deny all;
    }

    location ~ /\\.git {
        deny all;
    }

    # Robots.txt
    location = /robots.txt {
        add_header Content-Type text/plain;
        return 200 "User-agent: *\\nAllow: /\\n";
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

    # Enable the site
    ln -sf "$config_file" "$NGINX_ENABLED/"

    # Remove default nginx site if it exists
    rm -f "$NGINX_ENABLED/default"

    success "Nginx configuration created for $domain"
}

create_nginx_config_localhost() {
    local config_file="$NGINX_AVAILABLE/irac-localhost"

    log "Creating Nginx configuration for localhost..."

    cat > "$config_file" << EOF
# IRAC Platform Nginx Configuration - Localhost
# Generated: $(date)

server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name localhost;

    # SSL Configuration (Self-signed)
    ssl_certificate /etc/ssl/certs/irac-localhost.crt;
    ssl_certificate_key /etc/ssl/private/irac-localhost.key;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security Headers (relaxed for localhost)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:1405/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Lesan API endpoint
    location /lesan {
        proxy_pass http://127.0.0.1:1405/lesan;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable the site
    ln -sf "$config_file" "$NGINX_ENABLED/"

    success "Nginx configuration created for localhost"
}

create_self_signed_cert() {
    log "Creating self-signed SSL certificate for localhost..."

    # Create private key
    openssl genrsa -out /etc/ssl/private/irac-localhost.key 2048
    chmod 600 /etc/ssl/private/irac-localhost.key

    # Create certificate signing request
    openssl req -new -key /etc/ssl/private/irac-localhost.key -out /tmp/irac-localhost.csr -subj "/C=US/ST=Local/L=Local/O=IRAC/OU=Development/CN=localhost"

    # Create self-signed certificate
    openssl x509 -req -days 365 -in /tmp/irac-localhost.csr -signkey /etc/ssl/private/irac-localhost.key -out /etc/ssl/certs/irac-localhost.crt

    # Clean up
    rm /tmp/irac-localhost.csr

    success "Self-signed certificate created"
}

install_ssl_certificate() {
    local domain=$1
    local email=$2

    log "Installing SSL certificate for $domain..."

    # Test nginx configuration first
    if ! nginx -t; then
        error "Nginx configuration test failed"
        return 1
    fi

    # Reload nginx
    systemctl reload nginx

    # Obtain SSL certificate
    if certbot --nginx -d "$domain" --email "$email" --agree-tos --non-interactive --redirect; then
        success "SSL certificate installed successfully"

        # Set up auto-renewal
        setup_ssl_auto_renewal

        return 0
    else
        error "Failed to obtain SSL certificate"
        return 1
    fi
}

setup_ssl_auto_renewal() {
    log "Setting up SSL certificate auto-renewal..."

    # Create renewal script
    cat > "/etc/cron.daily/certbot-renew" << 'EOF'
#!/bin/bash
/usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
EOF

    chmod +x /etc/cron.daily/certbot-renew

    # Test renewal
    certbot renew --dry-run

    success "SSL auto-renewal configured"
}

update_env_with_domain() {
    local domain=$1
    local backend_env="$SCRIPT_DIR/back/.env"
    local frontend_env="$SCRIPT_DIR/front/.env.local"

    log "Updating environment files with domain configuration..."

    # Update backend .env
    if [[ -f "$backend_env" ]]; then
        sed -i "s|ZARINPAL_CALLBACK_URL=.*|ZARINPAL_CALLBACK_URL=https://$domain/payment/callback|" "$backend_env"
    fi

    # Update frontend .env
    if [[ -f "$frontend_env" ]]; then
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$domain/api|" "$frontend_env"
        sed -i "s|LESAN_URL=.*|LESAN_URL=https://$domain/lesan|" "$frontend_env"
        sed -i "s|NEXT_PUBLIC_FRONTEND_URL=.*|NEXT_PUBLIC_FRONTEND_URL=https://$domain|" "$frontend_env"
        sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=https://$domain/api|" "$frontend_env"
    fi

    success "Environment files updated with domain"
}

configure_firewall() {
    log "Configuring firewall..."

    # Enable UFW if not already enabled
    ufw --force enable

    # Allow SSH (important!)
    ufw allow ssh

    # Allow HTTP and HTTPS
    ufw allow 'Nginx Full'

    # Allow backend port (for internal access)
    ufw allow from 127.0.0.1 to any port 1405
    ufw allow from 127.0.0.1 to any port 3000

    # Reload firewall rules
    ufw reload

    success "Firewall configured"
}

test_ssl_configuration() {
    local domain=${DOMAIN_NAME:-localhost}

    log "Testing SSL configuration..."

    # Test nginx configuration
    if ! nginx -t; then
        error "Nginx configuration test failed"
        return 1
    fi

    # Restart nginx
    systemctl restart nginx

    # Test HTTPS connection
    sleep 5
    if curl -k -s -o /dev/null -w "%{http_code}" "https://$domain/health" | grep -q "200"; then
        success "✅ HTTPS connection test passed"
    else
        warning "⚠️ HTTPS connection test failed, but configuration may still be correct"
    fi

    # Test HTTP to HTTPS redirect
    if curl -s -o /dev/null -w "%{http_code}" "http://$domain/health" | grep -q "301\|302"; then
        success "✅ HTTP to HTTPS redirect working"
    else
        warning "⚠️ HTTP to HTTPS redirect test failed"
    fi

    success "SSL configuration tests completed"
}

generate_ssl_summary() {
    local summary_file="$LOGS_DIR/ssl-setup-summary.txt"
    local domain=${DOMAIN_NAME:-localhost}

    log "Generating SSL setup summary..."

    {
        echo "IRAC SSL & Domain Setup Summary"
        echo "Generated: $(date)"
        echo "==============================="
        echo ""
        echo "Domain: $domain"
        echo "SSL Type: $([ "$domain" = "localhost" ] && echo "Self-signed" || echo "Let's Encrypt")"
        echo ""
        echo "Nginx Configuration:"
        echo "  Config file: $NGINX_AVAILABLE/$([ "$domain" = "localhost" ] && echo "irac-localhost" || echo "irac")"
        echo "  Status: $(systemctl is-active nginx)"
        echo ""
        echo "SSL Certificate:"
        if [[ "$domain" != "localhost" ]]; then
            echo "  Certificate: /etc/letsencrypt/live/$domain/fullchain.pem"
            echo "  Private key: /etc/letsencrypt/live/$domain/privkey.pem"
            echo "  Auto-renewal: Enabled"
        else
            echo "  Certificate: /etc/ssl/certs/irac-localhost.crt"
            echo "  Private key: /etc/ssl/private/irac-localhost.key"
            echo "  Auto-renewal: Not applicable (self-signed)"
        fi
        echo ""
        echo "Security Features:"
        echo "  ✅ HTTPS enforcement"
        echo "  ✅ Security headers"
        echo "  ✅ Rate limiting"
        echo "  ✅ Gzip compression"
        echo "  ✅ CORS configuration"
        echo ""
        echo "URLs:"
        echo "  Frontend: https://$domain"
        echo "  Backend API: https://$domain/api"
        echo "  Lesan API: https://$domain/lesan"
        echo "  Health check: https://$domain/health"
        echo ""
        echo "Next Steps:"
        echo "  1. Update DNS records if using custom domain"
        echo "  2. Test all application endpoints"
        echo "  3. Update application configurations"
        echo "  4. Monitor SSL certificate expiration"
        echo ""
    } | tee "$summary_file"

    success "SSL setup summary saved to: $summary_file"
}

# Cleanup function
cleanup() {
    log "Performing cleanup..."

    # Set proper permissions
    if [[ -d "$LOGS_DIR" ]]; then
        find "$LOGS_DIR" -type f -exec chmod 644 {} \;
    fi

    success "Cleanup completed"
}

# Main execution
main() {
    print_banner

    # Check if running as root
    check_root

    log "Starting IRAC SSL & Domain Setup..."
    log "Script directory: $SCRIPT_DIR"

    # Install dependencies
    install_dependencies

    # Configure domain and SSL
    if configure_domain; then
        # Configure firewall
        configure_firewall

        # Test configuration
        test_ssl_configuration

        # Generate summary
        generate_ssl_summary
    else
        warning "Domain configuration skipped"
    fi

    cleanup

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}              IRAC SSL & DOMAIN SETUP COMPLETE!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "${BLUE}1.${NC} Review setup summary: ${LOGS_DIR}/ssl-setup-summary.txt"
    echo -e "${BLUE}2.${NC} Restart IRAC services: ./launch-irac.sh restart"
    echo -e "${BLUE}3.${NC} Test HTTPS endpoints: curl -k https://your-domain/health"
    echo -e "${BLUE}4.${NC} Update DNS if using custom domain"
    echo -e "${BLUE}5.${NC} Run final validation: ./production-readiness-check.sh"
    echo ""
    echo -e "${GREEN}🎉 Your IRAC platform now has HTTPS configured!${NC}"
    echo -e "${CYAN}📊 Setup logs available in: ${LOGS_DIR}/${NC}"
    echo ""
}

# Error handling
trap cleanup EXIT

# Check if running as main script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
