#!/usr/bin/env node

/**
 * IRAC Performance Benchmark Script
 * Version: 1.0
 * Purpose: Comprehensive performance testing and benchmarking
 * Author: IRAC Development Team
 * Date: December 2024
 */

import { performance } from 'perf_hooks';
import http from 'http';
import https from 'https';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const CONFIG = {
    backend: {
        url: 'http://localhost:1405',
        lesanEndpoint: '/lesan',
        healthEndpoint: '/health'
    },
    frontend: {
        url: 'http://localhost:3000'
    },
    targets: {
        apiResponseTime: 200,      // milliseconds
        frontendLoadTime: 3000,    // milliseconds
        databaseQueryTime: 50,     // milliseconds
        concurrentUsers: 100       // simultaneous requests
    },
    tests: {
        warmupRequests: 5,
        benchmarkRequests: 50,
        concurrentRequests: 20,
        timeout: 30000
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m'
};

// Utility functions
const log = (message, color = colors.reset) => {
    console.log(`${color}${message}${colors.reset}`);
};

const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
};

const makeRequest = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        const client = url.startsWith('https') ? https : http;

        const req = client.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || CONFIG.tests.timeout,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const endTime = performance.now();
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    responseTime: endTime - startTime,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });

        req.on('error', (error) => {
            const endTime = performance.now();
            reject({
                error: error.message,
                responseTime: endTime - startTime,
                success: false
            });
        });

        req.on('timeout', () => {
            req.destroy();
            const endTime = performance.now();
            reject({
                error: 'Request timeout',
                responseTime: endTime - startTime,
                success: false
            });
        });

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
};

// Performance test classes
class APIPerformanceTest {
    constructor() {
        this.results = {
            health: [],
            lesan: [],
            concurrent: []
        };
    }

    async warmup() {
        log(`\n🔥 Warming up API (${CONFIG.tests.warmupRequests} requests)...`, colors.yellow);

        for (let i = 0; i < CONFIG.tests.warmupRequests; i++) {
            try {
                await makeRequest(`${CONFIG.backend.url}${CONFIG.backend.healthEndpoint}`);
            } catch (error) {
                // Ignore warmup errors
            }
        }

        log('✅ Warmup complete', colors.green);
    }

    async testHealthEndpoint() {
        log('\n🏥 Testing Health Endpoint Performance...', colors.cyan);

        const results = [];
        let successCount = 0;

        for (let i = 0; i < CONFIG.tests.benchmarkRequests; i++) {
            try {
                const result = await makeRequest(`${CONFIG.backend.url}${CONFIG.backend.healthEndpoint}`);
                results.push(result.responseTime);
                if (result.success) successCount++;

                process.stdout.write(`\r  Progress: ${i + 1}/${CONFIG.tests.benchmarkRequests} (${Math.round((i + 1) / CONFIG.tests.benchmarkRequests * 100)}%)`);
            } catch (error) {
                results.push(error.responseTime || CONFIG.tests.timeout);
            }
        }

        this.results.health = results;
        console.log(); // New line after progress

        const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);
        const p95Time = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];
        const successRate = (successCount / CONFIG.tests.benchmarkRequests) * 100;

        log(`  Average: ${formatTime(avgTime)}`, avgTime < CONFIG.targets.apiResponseTime ? colors.green : colors.red);
        log(`  Minimum: ${formatTime(minTime)}`, colors.blue);
        log(`  Maximum: ${formatTime(maxTime)}`, colors.blue);
        log(`  95th percentile: ${formatTime(p95Time)}`, p95Time < CONFIG.targets.apiResponseTime ? colors.green : colors.red);
        log(`  Success rate: ${successRate.toFixed(1)}%`, successRate > 95 ? colors.green : colors.red);

        return {
            average: avgTime,
            minimum: minTime,
            maximum: maxTime,
            p95: p95Time,
            successRate: successRate,
            target: CONFIG.targets.apiResponseTime,
            passed: avgTime < CONFIG.targets.apiResponseTime
        };
    }

    async testLesanAPI() {
        log('\n🔌 Testing Lesan API Performance...', colors.cyan);

        const testPayload = JSON.stringify({
            wants: {
                model: "user",
                act: "testModels"
            }
        });

        const results = [];
        let successCount = 0;

        for (let i = 0; i < CONFIG.tests.benchmarkRequests; i++) {
            try {
                const result = await makeRequest(`${CONFIG.backend.url}${CONFIG.backend.lesanEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(testPayload)
                    },
                    body: testPayload
                });

                results.push(result.responseTime);
                if (result.success) successCount++;

                process.stdout.write(`\r  Progress: ${i + 1}/${CONFIG.tests.benchmarkRequests} (${Math.round((i + 1) / CONFIG.tests.benchmarkRequests * 100)}%)`);
            } catch (error) {
                results.push(error.responseTime || CONFIG.tests.timeout);
            }
        }

        this.results.lesan = results;
        console.log(); // New line after progress

        const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);
        const p95Time = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];
        const successRate = (successCount / CONFIG.tests.benchmarkRequests) * 100;

        log(`  Average: ${formatTime(avgTime)}`, avgTime < CONFIG.targets.apiResponseTime ? colors.green : colors.red);
        log(`  Minimum: ${formatTime(minTime)}`, colors.blue);
        log(`  Maximum: ${formatTime(maxTime)}`, colors.blue);
        log(`  95th percentile: ${formatTime(p95Time)}`, p95Time < CONFIG.targets.apiResponseTime ? colors.green : colors.red);
        log(`  Success rate: ${successRate.toFixed(1)}%`, successRate > 95 ? colors.green : colors.red);

        return {
            average: avgTime,
            minimum: minTime,
            maximum: maxTime,
            p95: p95Time,
            successRate: successRate,
            target: CONFIG.targets.apiResponseTime,
            passed: avgTime < CONFIG.targets.apiResponseTime
        };
    }

    async testConcurrentRequests() {
        log('\n🔀 Testing Concurrent Request Performance...', colors.cyan);

        const startTime = performance.now();
        const promises = [];

        for (let i = 0; i < CONFIG.tests.concurrentRequests; i++) {
            promises.push(
                makeRequest(`${CONFIG.backend.url}${CONFIG.backend.healthEndpoint}`)
                    .catch(error => ({ error: error.message, responseTime: error.responseTime || CONFIG.tests.timeout }))
            );
        }

        const results = await Promise.all(promises);
        const endTime = performance.now();

        const responseTimes = results.map(r => r.responseTime || 0);
        const successCount = results.filter(r => r.success).length;
        const totalTime = endTime - startTime;

        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const successRate = (successCount / CONFIG.tests.concurrentRequests) * 100;
        const requestsPerSecond = (CONFIG.tests.concurrentRequests / totalTime) * 1000;

        this.results.concurrent = results;

        log(`  Concurrent requests: ${CONFIG.tests.concurrentRequests}`, colors.blue);
        log(`  Total time: ${formatTime(totalTime)}`, colors.blue);
        log(`  Average response time: ${formatTime(avgTime)}`, avgTime < CONFIG.targets.apiResponseTime ? colors.green : colors.red);
        log(`  Success rate: ${successRate.toFixed(1)}%`, successRate > 95 ? colors.green : colors.red);
        log(`  Requests per second: ${requestsPerSecond.toFixed(1)} RPS`, colors.blue);

        return {
            concurrentRequests: CONFIG.tests.concurrentRequests,
            totalTime: totalTime,
            averageResponseTime: avgTime,
            successRate: successRate,
            requestsPerSecond: requestsPerSecond,
            passed: avgTime < CONFIG.targets.apiResponseTime && successRate > 95
        };
    }
}

class FrontendPerformanceTest {
    constructor() {
        this.results = {};
    }

    async testFrontendLoad() {
        log('\n🌐 Testing Frontend Load Performance...', colors.cyan);

        const results = [];
        let successCount = 0;

        for (let i = 0; i < 10; i++) {
            try {
                const result = await makeRequest(CONFIG.frontend.url);
                results.push(result.responseTime);
                if (result.success) successCount++;

                process.stdout.write(`\r  Progress: ${i + 1}/10 (${Math.round((i + 1) / 10 * 100)}%)`);
            } catch (error) {
                results.push(error.responseTime || CONFIG.tests.timeout);
            }
        }

        console.log(); // New line after progress

        const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);
        const successRate = (successCount / 10) * 100;

        log(`  Average load time: ${formatTime(avgTime)}`, avgTime < CONFIG.targets.frontendLoadTime ? colors.green : colors.red);
        log(`  Minimum load time: ${formatTime(minTime)}`, colors.blue);
        log(`  Maximum load time: ${formatTime(maxTime)}`, colors.blue);
        log(`  Success rate: ${successRate.toFixed(1)}%`, successRate > 95 ? colors.green : colors.red);

        this.results.frontend = {
            average: avgTime,
            minimum: minTime,
            maximum: maxTime,
            successRate: successRate,
            target: CONFIG.targets.frontendLoadTime,
            passed: avgTime < CONFIG.targets.frontendLoadTime
        };

        return this.results.frontend;
    }
}

class SystemResourceTest {
    constructor() {
        this.results = {};
    }

    async getSystemInfo() {
        log('\n🖥️  Testing System Resources...', colors.cyan);

        try {
            // Get memory usage
            const memInfo = await this.getMemoryInfo();

            // Get CPU info
            const cpuInfo = await this.getCPUInfo();

            // Get process info
            const processInfo = await this.getProcessInfo();

            // Get disk usage
            const diskInfo = await this.getDiskInfo();

            this.results.system = {
                memory: memInfo,
                cpu: cpuInfo,
                processes: processInfo,
                disk: diskInfo
            };

            // Display results
            log(`  CPU Cores: ${cpuInfo.cores}`, colors.blue);
            log(`  Total RAM: ${formatBytes(memInfo.total)}`, colors.blue);
            log(`  Available RAM: ${formatBytes(memInfo.available)}`, colors.blue);
            log(`  RAM Usage: ${((memInfo.used / memInfo.total) * 100).toFixed(1)}%`, colors.blue);
            log(`  Disk Usage: ${diskInfo.usage}`, colors.blue);

            if (processInfo.backend) {
                log(`  Backend Memory: ${formatBytes(processInfo.backend.memory * 1024)}`, colors.blue);
                log(`  Backend CPU: ${processInfo.backend.cpu.toFixed(1)}%`, colors.blue);
            }

            if (processInfo.frontend) {
                log(`  Frontend Memory: ${formatBytes(processInfo.frontend.memory * 1024)}`, colors.blue);
                log(`  Frontend CPU: ${processInfo.frontend.cpu.toFixed(1)}%`, colors.blue);
            }

            return this.results.system;
        } catch (error) {
            log(`  Error getting system info: ${error.message}`, colors.red);
            return null;
        }
    }

    async getMemoryInfo() {
        return new Promise((resolve) => {
            const proc = spawn('free', ['-b']);
            let output = '';

            proc.stdout.on('data', (data) => {
                output += data.toString();
            });

            proc.on('close', () => {
                const lines = output.split('\n');
                const memLine = lines[1].split(/\s+/);
                resolve({
                    total: parseInt(memLine[1]),
                    used: parseInt(memLine[2]),
                    free: parseInt(memLine[3]),
                    available: parseInt(memLine[6] || memLine[3])
                });
            });
        });
    }

    async getCPUInfo() {
        return new Promise((resolve) => {
            const proc = spawn('nproc');
            let output = '';

            proc.stdout.on('data', (data) => {
                output += data.toString();
            });

            proc.on('close', () => {
                resolve({
                    cores: parseInt(output.trim())
                });
            });
        });
    }

    async getProcessInfo() {
        return new Promise((resolve) => {
            const proc = spawn('ps', ['aux']);
            let output = '';

            proc.stdout.on('data', (data) => {
                output += data.toString();
            });

            proc.on('close', () => {
                const lines = output.split('\n');
                const processes = {};

                for (const line of lines) {
                    if (line.includes('deno') && line.includes('mod.ts')) {
                        const parts = line.split(/\s+/);
                        processes.backend = {
                            pid: parts[1],
                            cpu: parseFloat(parts[2]),
                            memory: parseInt(parts[5])
                        };
                    } else if (line.includes('node') && line.includes('next')) {
                        const parts = line.split(/\s+/);
                        processes.frontend = {
                            pid: parts[1],
                            cpu: parseFloat(parts[2]),
                            memory: parseInt(parts[5])
                        };
                    }
                }

                resolve(processes);
            });
        });
    }

    async getDiskInfo() {
        return new Promise((resolve) => {
            const proc = spawn('df', ['-h', '.']);
            let output = '';

            proc.stdout.on('data', (data) => {
                output += data.toString();
            });

            proc.on('close', () => {
                const lines = output.split('\n');
                if (lines[1]) {
                    const parts = lines[1].split(/\s+/);
                    resolve({
                        total: parts[1],
                        used: parts[2],
                        available: parts[3],
                        usage: parts[4]
                    });
                } else {
                    resolve({ usage: 'Unknown' });
                }
            });
        });
    }
}

// Main benchmark class
class PerformanceBenchmark {
    constructor() {
        this.apiTest = new APIPerformanceTest();
        this.frontendTest = new FrontendPerformanceTest();
        this.systemTest = new SystemResourceTest();
        this.results = {};
        this.startTime = Date.now();
    }

    async run() {
        this.printBanner();

        try {
            // System information
            const systemInfo = await this.systemTest.getSystemInfo();

            // API warmup
            await this.apiTest.warmup();

            // Run performance tests
            const healthResults = await this.apiTest.testHealthEndpoint();
            const lesanResults = await this.apiTest.testLesanAPI();
            const concurrentResults = await this.apiTest.testConcurrentRequests();
            const frontendResults = await this.frontendTest.testFrontendLoad();

            // Compile results
            this.results = {
                timestamp: new Date().toISOString(),
                duration: Date.now() - this.startTime,
                system: systemInfo,
                api: {
                    health: healthResults,
                    lesan: lesanResults,
                    concurrent: concurrentResults
                },
                frontend: frontendResults,
                targets: CONFIG.targets
            };

            // Generate report
            await this.generateReport();

        } catch (error) {
            log(`\n❌ Benchmark failed: ${error.message}`, colors.red);
            console.error(error);
        }
    }

    printBanner() {
        console.clear();
        log('═'.repeat(80), colors.cyan);
        log('🚀 IRAC PLATFORM PERFORMANCE BENCHMARK', colors.bold + colors.cyan);
        log('═'.repeat(80), colors.cyan);
        log(`🎯 Performance Targets:`, colors.white);
        log(`   • API Response Time: < ${CONFIG.targets.apiResponseTime}ms`, colors.blue);
        log(`   • Frontend Load Time: < ${formatTime(CONFIG.targets.frontendLoadTime)}`, colors.blue);
        log(`   • Database Query Time: < ${CONFIG.targets.databaseQueryTime}ms`, colors.blue);
        log(`   • Concurrent Users: ${CONFIG.targets.concurrentUsers}`, colors.blue);
        log('═'.repeat(80), colors.cyan);
    }

    async generateReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;

        log('\n═'.repeat(80), colors.cyan);
        log('📊 PERFORMANCE BENCHMARK SUMMARY', colors.bold + colors.cyan);
        log('═'.repeat(80), colors.cyan);

        // Overall score
        let totalTests = 0;
        let passedTests = 0;

        if (this.results.api.health.passed) passedTests++;
        totalTests++;

        if (this.results.api.lesan.passed) passedTests++;
        totalTests++;

        if (this.results.api.concurrent.passed) passedTests++;
        totalTests++;

        if (this.results.frontend.passed) passedTests++;
        totalTests++;

        const overallScore = Math.round((passedTests / totalTests) * 100);

        log(`\n🎯 OVERALL PERFORMANCE SCORE: ${overallScore}%`,
            overallScore >= 80 ? colors.green : overallScore >= 60 ? colors.yellow : colors.red);

        log(`⏱️  Total benchmark time: ${formatTime(totalDuration)}`, colors.blue);
        log(`✅ Tests passed: ${passedTests}/${totalTests}`, colors.blue);

        // Performance grade
        let grade = 'F';
        if (overallScore >= 90) grade = 'A';
        else if (overallScore >= 80) grade = 'B';
        else if (overallScore >= 70) grade = 'C';
        else if (overallScore >= 60) grade = 'D';

        log(`🏆 Performance Grade: ${grade}`,
            grade === 'A' ? colors.green : grade === 'B' ? colors.yellow : colors.red);

        // Recommendations
        log('\n💡 RECOMMENDATIONS:', colors.yellow);

        if (this.results.api.health.average > CONFIG.targets.apiResponseTime) {
            log('   • API response times exceed target - consider backend optimization', colors.yellow);
        }

        if (this.results.frontend.average > CONFIG.targets.frontendLoadTime) {
            log('   • Frontend load times exceed target - consider bundle optimization', colors.yellow);
        }

        if (overallScore === 100) {
            log('   🎉 All performance targets met! System is production-ready!', colors.green);
        } else {
            log(`   📈 ${totalTests - passedTests} performance targets need attention`, colors.yellow);
        }

        // Save detailed report
        await this.saveDetailedReport();

        log('\n═'.repeat(80), colors.cyan);
    }

    async saveDetailedReport() {
        const reportPath = path.join(process.cwd(), 'logs', `performance-benchmark-${Date.now()}.json`);

        try {
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
            log(`\n📄 Detailed report saved: ${reportPath}`, colors.blue);
        } catch (error) {
            log(`\n❌ Failed to save report: ${error.message}`, colors.red);
        }
    }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const benchmark = new PerformanceBenchmark();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        log('\n\n⚠️  Benchmark interrupted by user', colors.yellow);
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        log('\n\n⚠️  Benchmark terminated', colors.yellow);
        process.exit(0);
    });

    // Run benchmark
    benchmark.run().catch((error) => {
        log(`\n❌ Benchmark error: ${error.message}`, colors.red);
        process.exit(1);
    });
}

export default PerformanceBenchmark;
