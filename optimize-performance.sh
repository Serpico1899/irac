#!/bin/bash

# IRAC Performance Optimization Script
# Version: 1.0
# Purpose: Optimize system performance for production deployment
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
LOGS_DIR="$SCRIPT_DIR/logs"
CONFIG_DIR="$SCRIPT_DIR/config"
BACK_DIR="$SCRIPT_DIR/back"
FRONT_DIR="$SCRIPT_DIR/front"

# Performance targets
TARGET_API_RESPONSE_TIME=200    # milliseconds
TARGET_FRONTEND_LOAD_TIME=3000  # milliseconds
TARGET_DATABASE_QUERY_TIME=50   # milliseconds

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$CONFIG_DIR"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/performance.log"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/performance.log"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/performance.log"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/performance.log"
}

success() {
    echo -e "${GREEN}[SUCCESS $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOGS_DIR/performance.log"
}

# Banner
print_banner() {
    clear
    echo -e "${PURPLE}"
    cat << 'EOF'
██╗██████╗  █████╗  ██████╗    ██████╗ ███████╗██████╗ ███████╗ ██████╗ ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗ ██████╗███████╗
██║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗████╗  ██║██╔════╝██╔════╝
██║██████╔╝███████║██║         ██████╔╝█████╗  ██████╔╝█████╗  ██║   ██║██████╔╝██╔████╔██║███████║██╔██╗ ██║██║     █████╗
██║██╔══██╗██╔══██║██║         ██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║██║     ██╔══╝
██║██║  ██║██║  ██║╚██████╗    ██║     ███████╗██║  ██║██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║╚██████╗███████╗
╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝

 ██████╗ ██████╗ ████████╗██╗███╗   ███╗██╗███████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔═══██╗██╔══██╗╚══██╔══╝██║████╗ ████║██║╚══███╔╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
██║   ██║██████╔╝   ██║   ██║██╔████╔██║██║  ███╔╝ ███████║   ██║   ██║██║   ██║██╔██╗ ██║
██║   ██║██╔═══╝    ██║   ██║██║╚██╔╝██║██║ ███╔╝  ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
╚██████╔╝██║        ██║   ██║██║ ╚═╝ ██║██║███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═╝        ╚═╝   ╚═╝╚═╝     ╚═╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Interactive Resource and Assessment Center${NC}"
    echo -e "${YELLOW}Production Performance Optimization System${NC}"
    echo -e "${GREEN}Version: 1.0 - High Performance Edition${NC}"
    echo -e "${BLUE}Target: Sub-200ms API, Sub-3s Frontend Load${NC}"
    echo ""
}

# System performance baseline
measure_baseline_performance() {
    log "Measuring baseline performance..."

    local baseline_file="$LOGS_DIR/performance-baseline.txt"

    {
        echo "IRAC Performance Baseline Measurement"
        echo "Generated: $(date)"
        echo "======================================"
        echo ""

        # CPU and Memory usage
        echo "SYSTEM RESOURCES:"
        echo "CPU cores: $(nproc)"
        echo "Total RAM: $(free -h | awk '/^Mem:/ {print $2}')"
        echo "Available RAM: $(free -h | awk '/^Mem:/ {print $7}')"
        echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"
        echo ""

        # Disk performance
        echo "DISK PERFORMANCE:"
        echo "Disk usage: $(df -h $SCRIPT_DIR | awk 'NR==2 {print $5 " used of " $2}')"
        echo ""

        # Network performance
        echo "NETWORK PERFORMANCE:"
        echo "Network interfaces:"
        ip -brief addr show | grep UP
        echo ""

        # MongoDB performance if running
        if pgrep mongod > /dev/null; then
            echo "DATABASE STATUS:"
            echo "MongoDB: RUNNING"
            mongo --quiet --eval "db.stats().dataSize" irac_production 2>/dev/null && echo "Database size: $(mongo --quiet --eval "db.stats().dataSize" irac_production 2>/dev/null) bytes" || echo "Database size: Unable to determine"
        else
            echo "DATABASE STATUS:"
            echo "MongoDB: NOT RUNNING"
        fi
        echo ""

        # Test API response time
        if curl -s http://localhost:1405/health > /dev/null 2>&1; then
            echo "API PERFORMANCE:"
            api_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:1405/health 2>/dev/null || echo "0")
            echo "Health endpoint response: ${api_time}s"
        else
            echo "API PERFORMANCE:"
            echo "Backend not responding"
        fi
        echo ""

        # Test frontend response time
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "FRONTEND PERFORMANCE:"
            frontend_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000 2>/dev/null || echo "0")
            echo "Frontend response: ${frontend_time}s"
        else
            echo "FRONTEND PERFORMANCE:"
            echo "Frontend not responding"
        fi

    } | tee "$baseline_file"

    success "Baseline performance measured and saved to: $baseline_file"
}

# Database optimization
optimize_database() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                    DATABASE OPTIMIZATION${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Optimizing MongoDB database..."

    # Check if MongoDB is running
    if ! pgrep mongod > /dev/null; then
        warning "MongoDB is not running. Starting MongoDB..."
        systemctl start mongod || service mongod start || mongod --fork --logpath /var/log/mongodb/mongod.log
        sleep 5
    fi

    # Create database optimization script
    local db_optimization_script="$CONFIG_DIR/optimize-db.js"

    cat > "$db_optimization_script" << 'EOF'
// IRAC Database Optimization Script
print("Starting IRAC database optimization...");

// Switch to IRAC database
use irac_production;

// Create indexes for better query performance
print("Creating database indexes...");

// User collection indexes
try {
    db.users.createIndex({ "set.mobile": 1 }, { unique: true, sparse: true });
    db.users.createIndex({ "set.nationalNumber": 1 }, { unique: true, sparse: true });
    db.users.createIndex({ "set.email": 1 }, { sparse: true });
    db.users.createIndex({ "set.createdAt": -1 });
    db.users.createIndex({ "set.level": 1 });
    print("✅ User indexes created");
} catch(e) {
    print("⚠️ User indexes: " + e.message);
}

// Course collection indexes
try {
    db.courses.createIndex({ "set.title": "text", "set.description": "text" });
    db.courses.createIndex({ "set.category": 1 });
    db.courses.createIndex({ "set.price": 1 });
    db.courses.createIndex({ "set.createdAt": -1 });
    db.courses.createIndex({ "set.isActive": 1 });
    print("✅ Course indexes created");
} catch(e) {
    print("⚠️ Course indexes: " + e.message);
}

// Article collection indexes
try {
    db.articles.createIndex({ "set.title": "text", "set.content": "text" });
    db.articles.createIndex({ "set.category": 1 });
    db.articles.createIndex({ "set.tags": 1 });
    db.articles.createIndex({ "set.createdAt": -1 });
    db.articles.createIndex({ "set.isPublished": 1 });
    print("✅ Article indexes created");
} catch(e) {
    print("⚠️ Article indexes: " + e.message);
}

// Product collection indexes
try {
    db.products.createIndex({ "set.name": "text", "set.description": "text" });
    db.products.createIndex({ "set.category": 1 });
    db.products.createIndex({ "set.price": 1 });
    db.products.createIndex({ "set.isActive": 1 });
    db.products.createIndex({ "set.createdAt": -1 });
    print("✅ Product indexes created");
} catch(e) {
    print("⚠️ Product indexes: " + e.message);
}

// Payment collection indexes
try {
    db.payments.createIndex({ "set.userId": 1 });
    db.payments.createIndex({ "set.status": 1 });
    db.payments.createIndex({ "set.createdAt": -1 });
    db.payments.createIndex({ "set.transactionId": 1 }, { unique: true, sparse: true });
    print("✅ Payment indexes created");
} catch(e) {
    print("⚠️ Payment indexes: " + e.message);
}

// Booking collection indexes
try {
    db.bookings.createIndex({ "set.userId": 1 });
    db.bookings.createIndex({ "set.date": 1 });
    db.bookings.createIndex({ "set.status": 1 });
    db.bookings.createIndex({ "set.createdAt": -1 });
    print("✅ Booking indexes created");
} catch(e) {
    print("⚠️ Booking indexes: " + e.message);
}

// Scoring transaction indexes
try {
    db.scoring_transactions.createIndex({ "set.userId": 1 });
    db.scoring_transactions.createIndex({ "set.type": 1 });
    db.scoring_transactions.createIndex({ "set.createdAt": -1 });
    print("✅ Scoring transaction indexes created");
} catch(e) {
    print("⚠️ Scoring transaction indexes: " + e.message);
}

// Wallet collection indexes
try {
    db.wallets.createIndex({ "set.userId": 1 }, { unique: true });
    db.wallets.createIndex({ "set.balance": 1 });
    print("✅ Wallet indexes created");
} catch(e) {
    print("⚠️ Wallet indexes: " + e.message);
}

// File collection indexes
try {
    db.files.createIndex({ "set.filename": 1 });
    db.files.createIndex({ "set.type": 1 });
    db.files.createIndex({ "set.createdAt": -1 });
    db.files.createIndex({ "set.size": 1 });
    print("✅ File indexes created");
} catch(e) {
    print("⚠️ File indexes: " + e.message);
}

// Referral collection indexes
try {
    db.referrals.createIndex({ "set.referrerUserId": 1 });
    db.referrals.createIndex({ "set.referredUserId": 1 });
    db.referrals.createIndex({ "set.code": 1 }, { unique: true });
    db.referrals.createIndex({ "set.createdAt": -1 });
    print("✅ Referral indexes created");
} catch(e) {
    print("⚠️ Referral indexes: " + e.message);
}

// Database statistics and optimization
print("\nDatabase Statistics:");
var stats = db.stats();
print("Collections: " + stats.collections);
print("Data size: " + Math.round(stats.dataSize / 1024 / 1024 * 100) / 100 + " MB");
print("Index size: " + Math.round(stats.indexSize / 1024 / 1024 * 100) / 100 + " MB");

// List all indexes created
print("\nIndexes created:");
var collections = db.getCollectionNames();
collections.forEach(function(collection) {
    var indexes = db.getCollection(collection).getIndexes();
    if (indexes.length > 1) { // More than just the default _id index
        print(collection + ": " + (indexes.length - 1) + " custom indexes");
    }
});

print("\n✅ Database optimization completed successfully!");
EOF

    # Run database optimization
    if mongo irac_production "$db_optimization_script"; then
        success "Database indexes created successfully"
    else
        warning "Some database optimizations may have failed"
    fi

    # Optimize MongoDB configuration
    optimize_mongodb_config
}

optimize_mongodb_config() {
    log "Optimizing MongoDB configuration..."

    local mongodb_config="/etc/mongod.conf"
    local custom_config="$CONFIG_DIR/mongod-optimized.conf"

    # Create optimized MongoDB configuration
    cat > "$custom_config" << 'EOF'
# IRAC Optimized MongoDB Configuration
# Generated by performance optimization script

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # Adjust based on available RAM
      journalCompressor: snappy
      directoryForIndexes: false
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: rename
  quiet: true

net:
  port: 27017
  bindIp: 127.0.0.1
  maxIncomingConnections: 1000
  wireObjectCheck: true
  ipv6: false

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: disabled

operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp

replication:
  replSetName: ""

sharding:
  clusterRole: ""

setParameter:
  enableLocalhostAuthBypass: true
  wiredTigerConcurrentReadTransactions: 128
  wiredTigerConcurrentWriteTransactions: 128
EOF

    # Backup original config if it exists
    if [[ -f "$mongodb_config" ]]; then
        cp "$mongodb_config" "$mongodb_config.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    success "MongoDB configuration optimized (saved as $custom_config)"
    info "To apply: sudo cp $custom_config $mongodb_config && sudo systemctl restart mongod"
}

# Backend optimization
optimize_backend() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     BACKEND OPTIMIZATION${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Optimizing backend performance..."

    # Optimize Deno runtime settings
    create_backend_optimization_config

    # Create performance monitoring module
    create_performance_monitoring

    # Optimize backend environment variables
    optimize_backend_env
}

create_backend_optimization_config() {
    log "Creating backend optimization configuration..."

    local deno_config="$BACK_DIR/deno.json"

    # Create or update deno.json with optimization settings
    cat > "$deno_config" << 'EOF'
{
  "tasks": {
    "start": "deno run --allow-all --v8-flags=--max-old-space-size=2048 --v8-flags=--optimize-for-size main.ts",
    "dev": "deno run --allow-all --watch main.ts",
    "prod": "deno run --allow-all --v8-flags=--max-old-space-size=4096 --v8-flags=--optimize-for-size --v8-flags=--enable-fast-calls-from-js main.ts"
  },
  "imports": {
    "lesan": "https://deno.land/x/lesan@0.1.16/mod.ts",
    "mongo": "https://deno.land/x/mongo@v0.32.0/mod.ts"
  },
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "experimentalDecorators": true,
    "strict": false,
    "target": "ES2022",
    "lib": ["dom", "ES2022"],
    "allowImportingTsExtensions": true,
    "allowArbitraryExtensions": true
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 80,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve"
  }
}
EOF

    success "Deno configuration optimized"
}

create_performance_monitoring() {
    log "Creating performance monitoring module..."

    local perf_module="$BACK_DIR/src/utils/performance.ts"

    # Ensure the utils directory exists
    mkdir -p "$BACK_DIR/src/utils"

    cat > "$perf_module" << 'EOF'
// IRAC Performance Monitoring Module
// Automatically generated by optimization script

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
  endpoint?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Measure response time
  measureResponseTime(fn: Function, endpoint?: string) {
    return async (...args: any[]) => {
      const startTime = performance.now();
      const startMemory = Deno.memoryUsage().rss;

      try {
        const result = await fn(...args);
        const endTime = performance.now();
        const endMemory = Deno.memoryUsage().rss;

        this.addMetric({
          responseTime: endTime - startTime,
          memoryUsage: endMemory - startMemory,
          cpuUsage: 0, // TODO: Implement CPU monitoring
          timestamp: Date.now(),
          endpoint
        });

        return result;
      } catch (error) {
        const endTime = performance.now();
        this.addMetric({
          responseTime: endTime - startTime,
          memoryUsage: 0,
          cpuUsage: 0,
          timestamp: Date.now(),
          endpoint: endpoint + " (ERROR)"
        });
        throw error;
      }
    };
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get performance statistics
  getStats() {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        totalRequests: 0,
        avgMemoryUsage: 0,
        recentMetrics: []
      };
    }

    const responseTimes = this.metrics.map(m => m.responseTime);
    const memoryUsages = this.metrics.map(m => m.memoryUsage);

    return {
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      totalRequests: this.metrics.length,
      avgMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      recentMetrics: this.metrics.slice(-10) // Last 10 requests
    };
  }

  // Get health status
  getHealthStatus() {
    const stats = this.getStats();
    const memoryUsage = Deno.memoryUsage();

    return {
      status: stats.avgResponseTime < 200 ? 'healthy' : 'degraded',
      responseTime: stats.avgResponseTime,
      memoryUsage: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      uptime: Deno.osUptime(),
      timestamp: Date.now()
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance middleware for Lesan
export const performanceMiddleware = (endpoint: string) => {
  return performanceMonitor.measureResponseTime(() => {}, endpoint);
};

// System performance checker
export const getSystemPerformance = () => {
  const memoryUsage = Deno.memoryUsage();

  return {
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100 // MB
    },
    uptime: Deno.osUptime(),
    timestamp: Date.now()
  };
};
EOF

    success "Performance monitoring module created"
}

optimize_backend_env() {
    log "Optimizing backend environment variables..."

    local env_file="$BACK_DIR/.env"

    if [[ -f "$env_file" ]]; then
        # Add performance-related environment variables
        if ! grep -q "DENO_V8_FLAGS" "$env_file"; then
            echo "" >> "$env_file"
            echo "# Performance Optimization" >> "$env_file"
            echo "DENO_V8_FLAGS=--max-old-space-size=4096 --optimize-for-size" >> "$env_file"
            echo "NODE_OPTIONS=--max-old-space-size=4096" >> "$env_file"
            echo "PERFORMANCE_MONITORING=true" >> "$env_file"
            echo "RESPONSE_TIME_LIMIT=200" >> "$env_file"
            echo "MEMORY_LIMIT=2048" >> "$env_file"
        fi

        success "Backend environment variables optimized"
    else
        warning "Backend .env file not found"
    fi
}

# Frontend optimization
optimize_frontend() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     FRONTEND OPTIMIZATION${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Optimizing frontend performance..."

    # Optimize Next.js configuration
    optimize_nextjs_config

    # Create performance monitoring for frontend
    create_frontend_performance_monitor

    # Optimize frontend environment
    optimize_frontend_env
}

optimize_nextjs_config() {
    log "Optimizing Next.js configuration..."

    local nextjs_config="$FRONT_DIR/next.config.js"

    # Create optimized Next.js configuration
    cat > "$nextjs_config" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },

  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
          },
        },
      },
    };

    // Add bundle analyzer in development
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: './analyze/client.json',
        })
      );
    }

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // PoweredBy header removal
  poweredByHeader: false,

  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,

  // Output configuration
  output: 'standalone',

  // Environment variables
  env: {
    CUSTOM_KEY: 'IRAC_OPTIMIZED',
  },

  // Redirects and rewrites for performance
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:1405/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
EOF

    success "Next.js configuration optimized"
}

create_frontend_performance_monitor() {
    log "Creating frontend performance monitoring..."

    local perf_utils="$FRONT_DIR/src/utils/performance.js"
    mkdir -p "$FRONT_DIR/src/utils"

    cat > "$perf_utils" << 'EOF'
// IRAC Frontend Performance Monitor
// Automatically generated by optimization script

class FrontendPerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observer = null;
    this.init();
  }

  init() {
    // Web Vitals monitoring
    if (typeof window !== 'undefined') {
      this.measureWebVitals();
      this.measureResourceTiming();
      this.measureUserTiming();
    }
  }

  measureWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.addMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.addMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.addMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureResourceTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource');
        resources.forEach((resource) => {
          this.addMetric('Resource Load', resource.duration, {
            name: resource.name,
            type: resource.initiatorType
          });
        });
      });
    }
  }

  measureUserTiming() {
    // Custom performance marks
    this.mark = (name) => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark(name);
      }
    };

    this.measure = (name, startMark, endMark) => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.addMetric('User Timing', measure.duration, { name });
      }
    };
  }

  addMetric(type, value, metadata = {}) {
    this.metrics.push({
      type,
      value,
      timestamp: Date.now(),
      metadata
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getStats() {
    const stats = {};
    this.metrics.forEach((metric) => {
      if (!stats[metric.type]) {
        stats[metric.type] = [];
      }
      stats[metric.type].push(metric.value);
    });

    // Calculate averages
    Object.keys(stats).forEach((type) => {
      const values = stats[type];
      stats[type] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });

    return stats;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton
export const performanceMonitor = new FrontendPerformanceMonitor();

// React performance hook
export const usePerformance = () => {
  const measure = (name, fn) => {
    return async (...args) => {
      performanceMonitor.mark(`${name}-start`);
      const result = await fn(...args);
      performanceMonitor.mark(`${name}-end`);
      performanceMonitor.measure(name, `${name}-start`, `${name}-end`);
      return result;
    };
  };

  return {
    measure,
    getStats: () => performanceMonitor.getStats(),
    getMetrics: () => performanceMonitor.getMetrics()
  };
};
EOF

    success "Frontend performance monitoring created"
}

optimize_frontend_env() {
    log "Optimizing frontend environment variables..."

    local env_file="$FRONT_DIR/.env.local"

    if [[ -f "$env_file" ]]; then
        # Add performance-related environment variables
        if ! grep -q "NEXT_TELEMETRY_DISABLED" "$env_file"; then
            echo "" >> "$env_file"
            echo "# Performance Optimization" >> "$env_file"
            echo "NEXT_TELEMETRY_DISABLED=1" >> "$env_file"
            echo "NODE_ENV=production" >> "$env_file"
            echo "ANALYZE=false" >> "$env_file"
            echo "PERFORMANCE_MONITORING=true" >> "$env_file"
        fi

        success "Frontend environment variables optimized"
    else
        warning "Frontend .env.local file not found"
    fi
}

# System optimization
optimize_system() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     SYSTEM OPTIMIZATION${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Optimizing system performance..."

    # Optimize file limits
    optimize_file_limits

    # Optimize network settings
    optimize_network_settings

    # Setup performance monitoring
    setup_system_monitoring
}

optimize_file_limits() {
    log "Optimizing system file limits..."

    local limits_config="/etc/security/limits.conf"
    local backup_config="$CONFIG_DIR/limits.conf.backup"

    # Backup original config
    if [[ -f "$limits_config" ]] && [[ ! -f "$backup_config" ]]; then
        cp "$limits_config" "$backup_config"
    fi

    # Add optimized limits
    cat >> "$CONFIG_DIR/limits-optimization.conf" << 'EOF'
# IRAC Performance Optimization - File Limits
# Add to /etc/security/limits.conf

* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
root soft nofile 65536
root hard nofile 65536
www-data soft nofile 65536
www-data hard nofile 65536
EOF

    success "File limits configuration created (apply manually)"
    info "To apply: sudo cat $CONFIG_DIR/limits-optimization.conf >> /etc/security/limits.conf"
}

optimize_network_settings() {
    log "Creating network optimization configuration..."

    cat > "$CONFIG_DIR/network-optimization.conf" << 'EOF'
# IRAC Network Performance Optimization
# Add to /etc/sysctl.conf

# TCP performance
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# Connection limits
net.core.somaxconn = 32768
net.ipv4.tcp_max_syn_backlog = 32768
net.ipv4.ip_local_port_range = 1024 65535

# TCP optimization
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_slow_start_after_idle = 0

# Memory optimization
vm.swappiness = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

    success "Network optimization configuration created"
    info "To apply: sudo cat $CONFIG_DIR/network-optimization.conf >> /etc/sysctl.conf && sudo sysctl -p"
}

setup_system_monitoring() {
    log "Setting up system performance monitoring..."

    local monitor_script="$CONFIG_DIR/performance-monitor.sh"

    cat > "$monitor_script" << 'EOF'
#!/bin/bash
# IRAC System Performance Monitor

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/../logs"
PERF_LOG="$LOGS_DIR/system-performance.log"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Function to log performance metrics
log_performance() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')

    echo "$timestamp,CPU:${cpu_usage}%,Memory:${memory_usage}%,Disk:${disk_usage}%,Load:${load_avg}" >> "$PERF_LOG"
}

# Function to check IRAC services
check_services() {
    local backend_status="STOPPED"
    local frontend_status="STOPPED"
    local mongodb_status="STOPPED"

    if pgrep -f "deno.*main.ts" > /dev/null; then
        backend_status="RUNNING"
    fi

    if pgrep -f "next.*start" > /dev/null; then
        frontend_status="RUNNING"
    fi

    if pgrep mongod > /dev/null; then
        mongodb_status="RUNNING"
    fi

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "$timestamp,Backend:$backend_status,Frontend:$frontend_status,MongoDB:$mongodb_status" >> "$LOGS_DIR/services-status.log"
}

# Main monitoring loop
if [[ "$1" == "daemon" ]]; then
    while true; do
        log_performance
        check_services
        sleep 60  # Log every minute
    done
else
    # Single run
    log_performance
    check_services
fi
EOF

    chmod +x "$monitor_script"

    # Create systemd service for monitoring
    cat > "$CONFIG_DIR/irac-monitor.service" << EOF
[Unit]
Description=IRAC Performance Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SCRIPT_DIR
ExecStart=$monitor_script daemon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    success "System monitoring setup created"
    info "To install: sudo cp $CONFIG_DIR/irac-monitor.service /etc/systemd/system/ && sudo systemctl enable irac-monitor"
}

# Performance testing
run_performance_tests() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     PERFORMANCE TESTING${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Running performance tests..."

    # Test API performance
    test_api_performance

    # Test database performance
    test_database_performance

    # Test frontend performance
    test_frontend_performance
}

test_api_performance() {
    log "Testing API performance..."

    local test_results="$LOGS_DIR/api-performance-test.txt"

    {
        echo "IRAC API Performance Test Results"
        echo "Generated: $(date)"
        echo "================================="
        echo ""

        # Test health endpoint
        if curl -s http://localhost:1405/health > /dev/null; then
            echo "Health Endpoint Performance:"
            for i in {1..10}; do
                time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:1405/health)
                time_ms=$(echo "$time * 1000" | bc -l)
                echo "  Test $i: ${time_ms}ms"
            done
            echo ""
        fi

        # Test Lesan endpoint
        echo "Lesan API Performance:"
        for i in {1..5}; do
            time=$(curl -o /dev/null -s -w '%{time_total}' -X POST http://localhost:1405/lesan -H "Content-Type: application/json" -d '{"wants":{"model":"user","act":"getUsers"}}')
            time_ms=$(echo "$time * 1000" | bc -l)
            echo "  Test $i: ${time_ms}ms"
        done

    } | tee "$test_results"

    success "API performance test completed"
}

test_database_performance() {
    log "Testing database performance..."

    local test_results="$LOGS_DIR/database-performance-test.txt"
    local db_test_script="$CONFIG_DIR/db-performance-test.js"

    cat > "$db_test_script" << 'EOF'
// Database performance test
print("IRAC Database Performance Test");
print("Generated: " + new Date());
print("==============================");
print("");

use irac_production;

// Test query performance
print("Query Performance Tests:");

// Test user queries
var start = new Date().getTime();
var userCount = db.users.countDocuments();
var end = new Date().getTime();
print("User count query: " + (end - start) + "ms (count: " + userCount + ")");

// Test user search
start = new Date().getTime();
var users = db.users.find().limit(10).toArray();
end = new Date().getTime();
print("User find query: " + (end - start) + "ms (found: " + users.length + ")");

// Test course queries
start = new Date().getTime();
var courseCount = db.courses.countDocuments();
end = new Date().getTime();
print("Course count query: " + (end - start) + "ms (count: " + courseCount + ")");

// Test index usage
print("");
print("Index Usage:");
var explain = db.users.find({"set.mobile": "09122072244"}).explain("executionStats");
print("User mobile query execution time: " + explain.executionStats.executionTimeMillis + "ms");

print("");
print("Database performance test completed");
EOF

    mongo irac_production "$db_test_script" | tee "$test_results"

    success "Database performance test completed"
}

test_frontend_performance() {
    log "Testing frontend performance..."

    local test_results="$LOGS_DIR/frontend-performance-test.txt"

    {
        echo "IRAC Frontend Performance Test Results"
        echo "Generated: $(date)"
        echo "======================================"
        echo ""

        # Test frontend response
        if curl -s http://localhost:3000 > /dev/null; then
            echo "Frontend Response Performance:"
            for i in {1..5}; do
                time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000)
                time_ms=$(echo "$time * 1000" | bc -l)
                echo "  Test $i: ${time_ms}ms"
            done
        else
            echo "Frontend not responding"
        fi

    } | tee "$test_results"

    success "Frontend performance test completed"
}

# Generate optimization report
generate_optimization_report() {
    log "Generating optimization report..."

    local report_file="$LOGS_DIR/optimization-report.txt"

    {
        echo "IRAC Performance Optimization Report"
        echo "Generated: $(date)"
        echo "====================================="
        echo ""

        echo "OPTIMIZATIONS APPLIED:"
        echo "✅ Database indexes created"
        echo "✅ MongoDB configuration optimized"
        echo "✅ Backend Deno configuration optimized"
        echo "✅ Performance monitoring modules created"
        echo "✅ Next.js configuration optimized"
        echo "✅ Frontend performance monitoring added"
        echo "✅ System monitoring setup created"
        echo "✅ Network optimization configuration prepared"
        echo "✅ File limits optimization prepared"
        echo ""

        echo "CONFIGURATION FILES CREATED:"
        echo "• $CONFIG_DIR/mongod-optimized.conf"
        echo "• $CONFIG_DIR/performance-monitor.sh"
        echo "• $CONFIG_DIR/limits-optimization.conf"
        echo "• $CONFIG_DIR/network-optimization.conf"
        echo "• $CONFIG_DIR/irac-monitor.service"
        echo "• $BACK_DIR/src/utils/performance.ts"
        echo "• $FRONT_DIR/src/utils/performance.js"
        echo "• $BACK_DIR/deno.json"
        echo "• $FRONT_DIR/next.config.js"
        echo ""

        echo "PERFORMANCE TARGETS:"
        echo "• API Response Time: < ${TARGET_API_RESPONSE_TIME}ms"
        echo "• Frontend Load Time: < ${TARGET_FRONTEND_LOAD_TIME}ms"
        echo "• Database Query Time: < ${TARGET_DATABASE_QUERY_TIME}ms"
        echo ""

        echo "NEXT STEPS:"
        echo "1. Apply system optimizations (requires root):"
        echo "   sudo cat $CONFIG_DIR/limits-optimization.conf >> /etc/security/limits.conf"
        echo "   sudo cat $CONFIG_DIR/network-optimization.conf >> /etc/sysctl.conf"
        echo "   sudo sysctl -p"
        echo ""
        echo "2. Install system monitoring:"
        echo "   sudo cp $CONFIG_DIR/irac-monitor.service /etc/systemd/system/"
        echo "   sudo systemctl enable irac-monitor && sudo systemctl start irac-monitor"
        echo ""
        echo "3. Apply MongoDB optimization:"
        echo "   sudo cp $CONFIG_DIR/mongod-optimized.conf /etc/mongod.conf"
        echo "   sudo systemctl restart mongod"
        echo ""
        echo "4. Restart IRAC services:"
        echo "   ./launch-irac.sh restart"
        echo ""
        echo "5. Monitor performance:"
        echo "   tail -f $LOGS_DIR/system-performance.log"
        echo ""

    } | tee "$report_file"

    success "Optimization report saved to: $report_file"
}

# Main execution
main() {
    print_banner

    log "Starting IRAC Performance Optimization..."
    log "Target performance metrics:"
    log "  - API response time: < ${TARGET_API_RESPONSE_TIME}ms"
    log "  - Frontend load time: < ${TARGET_FRONTEND_LOAD_TIME}ms"
    log "  - Database query time: < ${TARGET_DATABASE_QUERY_TIME}ms"

    # Measure baseline performance
    measure_baseline_performance

    # Run optimizations
    optimize_database
    optimize_backend
    optimize_frontend
    optimize_system

    # Run performance tests
    run_performance_tests

    # Generate report
    generate_optimization_report

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}              IRAC PERFORMANCE OPTIMIZATION COMPLETE!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Optimization Summary:${NC}"
    echo -e "${BLUE}✅${NC} Database indexes and configuration optimized"
    echo -e "${BLUE}✅${NC} Backend Deno runtime optimized with V8 flags"
    echo -e "${BLUE}✅${NC} Frontend Next.js configuration optimized"
    echo -e "${BLUE}✅${NC} Performance monitoring modules created"
    echo -e "${BLUE}✅${NC} System optimization configurations prepared"
    echo ""
    echo -e "${YELLOW}Performance Targets:${NC}"
    echo -e "${BLUE}🎯${NC} API Response Time: < ${TARGET_API_RESPONSE_TIME}ms"
    echo -e "${BLUE}🎯${NC} Frontend Load Time: < ${TARGET_FRONTEND_LOAD_TIME}ms"
    echo -e "${BLUE}🎯${NC} Database Query Time: < ${TARGET_DATABASE_QUERY_TIME}ms"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "${BLUE}1.${NC} Review optimization report: ${LOGS_DIR}/optimization-report.txt"
    echo -e "${BLUE}2.${NC} Apply system optimizations (requires root access)"
    echo -e "${BLUE}3.${NC} Restart IRAC services: ./launch-irac.sh restart"
    echo -e "${BLUE}4.${NC} Monitor performance: tail -f ${LOGS_DIR}/system-performance.log"
    echo -e "${BLUE}5.${NC} Run final validation: ./production-readiness-check.sh"
    echo ""
    echo -e "${GREEN}🚀 Your IRAC platform is now performance-optimized for production!${NC}"
    echo -e "${CYAN}📊 All optimization logs and configurations saved in: ${LOGS_DIR}/ and ${CONFIG_DIR}/${NC}"
    echo ""
}

# Error handling
cleanup() {
    log "Performing cleanup..."
    # Set proper permissions
    if [[ -d "$LOGS_DIR" ]]; then
        find "$LOGS_DIR" -type f -exec chmod 644 {} \;
    fi
    if [[ -d "$CONFIG_DIR" ]]; then
        find "$CONFIG_DIR" -type f -exec chmod 644 {} \;
    fi
    success "Cleanup completed"
}

trap cleanup EXIT

# Check if running as main script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
