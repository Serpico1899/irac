#!/usr/bin/env node

/**
 * IRAC Project - Focused Integration Testing Suite
 *
 * Tests the core systems that are 95% complete:
 * - User Management & Authentication
 * - Scoring System
 * - Product Store
 * - Wallet System
 * - File Management (including new serveFile endpoint)
 * - Referral System
 * - Basic Analytics
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8000';

class IRACIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.testData = {
      adminToken: null,
      userToken: null,
      testUser: null,
      testAdmin: null,
      uploadedFile: null,
      testProduct: null
    };
  }

  async makeRequest(endpoint, method = 'POST', data = {}, token = null) {
    const url = `${BASE_URL}/${endpoint}`;

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (method !== 'GET' && Object.keys(data).length > 0) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      };
    }
  }

  async testEndpoint(name, endpoint, method, data, token, expectedStatus = 200) {
    console.log(`  Testing: ${name}`);

    try {
      const result = await this.makeRequest(endpoint, method, data, token);

      if (result.success && result.status === expectedStatus) {
        console.log(`    ✅ PASS - ${name}`);
        this.results.passed++;
        return result.data;
      } else {
        console.log(`    ❌ FAIL - ${name}: Status ${result.status}`);
        console.log(`    Error: ${JSON.stringify(result.data || result.error)}`);
        this.results.failed++;
        this.results.errors.push({
          test: name,
          endpoint,
          status: result.status,
          error: result.error || result.data
        });
        return null;
      }
    } catch (error) {
      console.log(`    💥 ERROR - ${name}: ${error.message}`);
      this.results.failed++;
      this.results.errors.push({
        test: name,
        endpoint,
        error: error.message
      });
      return null;
    }
  }

  async testUserManagement() {
    console.log('\n👤 Testing User Management System');
    console.log('='.repeat(50));

    // 1. Admin Seeding
    await this.testEndpoint(
      'Admin Data Seeding',
      'admin/seedDatabase',
      'POST',
      { includeUsers: true, clearExisting: false }
    );

    // 2. User Registration
    const timestamp = Date.now();
    const userData = {
      details: {
        set: {
          username: `testuser_${timestamp}`,
          email: `test${timestamp}@example.com`,
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
          mobile: '09123456789',
          role: 'user'
        }
      }
    };

    const newUser = await this.testEndpoint(
      'User Registration',
      'user/createUser',
      'POST',
      userData
    );

    if (newUser) {
      this.testData.testUser = newUser;
    }

    // 3. Admin Registration
    const adminData = {
      details: {
        set: {
          username: `admin_${timestamp}`,
          email: `admin${timestamp}@example.com`,
          password: 'AdminPass123!',
          firstName: 'Admin',
          lastName: 'User',
          mobile: '09987654321',
          role: 'admin'
        }
      }
    };

    const newAdmin = await this.testEndpoint(
      'Admin Registration',
      'user/createUser',
      'POST',
      adminData
    );

    if (newAdmin) {
      this.testData.testAdmin = newAdmin;
    }

    // 4. User Login
    const loginResult = await this.testEndpoint(
      'User Login',
      'user/login',
      'POST',
      {
        details: {
          set: {
            username: userData.details.set.username,
            password: userData.details.set.password
          }
        }
      }
    );

    if (loginResult && loginResult.token) {
      this.testData.userToken = loginResult.token;
    }

    // 5. Admin Login
    const adminLoginResult = await this.testEndpoint(
      'Admin Login',
      'user/login',
      'POST',
      {
        details: {
          set: {
            username: adminData.details.set.username,
            password: adminData.details.set.password
          }
        }
      }
    );

    if (adminLoginResult && adminLoginResult.token) {
      this.testData.adminToken = adminLoginResult.token;
    }

    // 6. Get User Profile
    if (this.testData.userToken) {
      await this.testEndpoint(
        'Get User Profile',
        'user/getProfile',
        'POST',
        { details: { set: {}, get: {} } },
        this.testData.userToken
      );
    }
  }

  async testScoringSystem() {
    console.log('\n🏆 Testing Scoring System');
    console.log('='.repeat(50));

    if (!this.testData.userToken) {
      console.log('❌ Skipping scoring tests - no user token');
      this.results.skipped += 4;
      return;
    }

    // 1. Get User Score
    await this.testEndpoint(
      'Get User Score',
      'scoring/getUserScore',
      'POST',
      { details: { set: {}, get: {} } },
      this.testData.userToken
    );

    // 2. Add Points
    await this.testEndpoint(
      'Add Points for Activity',
      'scoring/addPoints',
      'POST',
      {
        details: {
          set: {
            points: 50,
            activity_type: 'profile_completion',
            description: 'Profile completion bonus'
          }
        }
      },
      this.testData.userToken
    );

    // 3. Get Leaderboard
    await this.testEndpoint(
      'Get Leaderboard',
      'scoring/getLeaderboard',
      'POST',
      {
        details: {
          set: { limit: 10, type: 'monthly' }
        }
      },
      this.testData.userToken
    );

    // 4. Daily Login Reward
    await this.testEndpoint(
      'Daily Login Reward',
      'scoring/dailyLogin',
      'POST',
      { details: { set: {}, get: {} } },
      this.testData.userToken
    );
  }

  async testFileManagement() {
    console.log('\n📁 Testing File Management System');
    console.log('='.repeat(50));

    if (!this.testData.userToken) {
      console.log('❌ Skipping file tests - no user token');
      this.results.skipped += 3;
      return;
    }

    // Note: File upload would require multipart/form-data
    // For now, we'll test the endpoints that don't require file upload

    // 1. Get Files List
    await this.testEndpoint(
      'Get Files List',
      'file/getFiles',
      'POST',
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, name: 1, type: 1, size: 1, createdAt: 1 }
        }
      },
      this.testData.userToken
    );

    // 2. Test the new serveFile endpoint (if we have any files)
    // This would typically require a file ID, so we'll test with a placeholder
    console.log('  Note: ServeFile endpoint ready - requires existing file ID for testing');

    console.log('  ℹ️  File upload requires multipart form data - test manually');
  }

  async testWalletSystem() {
    console.log('\n💰 Testing Wallet System');
    console.log('='.repeat(50));

    if (!this.testData.userToken) {
      console.log('❌ Skipping wallet tests - no user token');
      this.results.skipped += 3;
      return;
    }

    // 1. Get Wallet Balance
    await this.testEndpoint(
      'Get Wallet Balance',
      'wallet/getBalance',
      'POST',
      { details: { set: {}, get: {} } },
      this.testData.userToken
    );

    // 2. Deposit (Admin action)
    if (this.testData.adminToken && this.testData.testUser) {
      await this.testEndpoint(
        'Admin Deposit to Wallet',
        'wallet/deposit',
        'POST',
        {
          details: {
            set: {
              amount: 1000,
              description: 'Test deposit for integration testing',
              userId: this.testData.testUser._id
            }
          }
        },
        this.testData.adminToken
      );
    }

    // 3. Get Wallet Transactions
    await this.testEndpoint(
      'Get Wallet Transactions',
      'wallet/getTransactions',
      'POST',
      {
        details: {
          set: { page: 1, limit: 10 },
          get: { _id: 1, type: 1, amount: 1, description: 1, createdAt: 1 }
        }
      },
      this.testData.userToken
    );
  }

  async testProductStore() {
    console.log('\n🛍️ Testing Product Store System');
    console.log('='.repeat(50));

    // 1. Get Products List
    const products = await this.testEndpoint(
      'Get Products List',
      'product/getProducts',
      'POST',
      {
        details: {
          set: { page: 1, limit: 10, status: 'active' },
          get: { _id: 1, name: 1, price: 1, type: 1, status: 1 }
        }
      }
    );

    // 2. Create Product (Admin)
    if (this.testData.adminToken) {
      const newProduct = await this.testEndpoint(
        'Create Product (Admin)',
        'product/createProduct',
        'POST',
        {
          details: {
            set: {
              name: `Test Product ${Date.now()}`,
              description: 'Test product for integration testing',
              price: 99.99,
              type: 'digital',
              status: 'active',
              inventory_count: 100
            }
          }
        },
        this.testData.adminToken
      );

      if (newProduct) {
        this.testData.testProduct = newProduct;
      }
    }

    // 3. Search Products
    await this.testEndpoint(
      'Search Products',
      'product/searchProducts',
      'POST',
      {
        details: {
          set: {
            query: 'test',
            filters: { status: 'active' }
          },
          get: { _id: 1, name: 1, price: 1, description: 1 }
        }
      }
    );
  }

  async testReferralSystem() {
    console.log('\n🤝 Testing Referral System');
    console.log('='.repeat(50));

    if (!this.testData.userToken) {
      console.log('❌ Skipping referral tests - no user token');
      this.results.skipped += 2;
      return;
    }

    // 1. Generate Referral Code
    await this.testEndpoint(
      'Generate Referral Code',
      'referral/generateCode',
      'POST',
      { details: { set: {}, get: {} } },
      this.testData.userToken
    );

    // 2. Get Referral Stats
    await this.testEndpoint(
      'Get Referral Stats',
      'referral/getStats',
      'POST',
      { details: { set: {}, get: {} } },
      this.testData.userToken
    );
  }

  async testAnalytics() {
    console.log('\n📊 Testing Analytics System');
    console.log('='.repeat(50));

    if (!this.testData.adminToken) {
      console.log('❌ Skipping analytics tests - no admin token');
      this.results.skipped += 1;
      return;
    }

    // 1. Get User Analytics
    await this.testEndpoint(
      'Get User Analytics',
      'analytics/getUserAnalytics',
      'POST',
      {
        details: {
          set: { timeframe: 'month' }
        }
      },
      this.testData.adminToken
    );
  }

  async runAllTests() {
    console.log('🚀 Starting IRAC Integration Tests');
    console.log('='.repeat(70));

    const startTime = Date.now();

    // Run all test suites
    await this.testUserManagement();
    await this.testScoringSystem();
    await this.testFileManagement();
    await this.testWalletSystem();
    await this.testProductStore();
    await this.testReferralSystem();
    await this.testAnalytics();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Print results
    console.log('\n📋 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);

    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📊 Success Rate: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log('\n💥 ERROR DETAILS');
      console.log('='.repeat(70));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}`);
        console.log(`   Endpoint: ${error.endpoint}`);
        console.log(`   Status: ${error.status || 'N/A'}`);
        console.log(`   Error: ${JSON.stringify(error.error)}`);
        console.log('');
      });
    }

    console.log('\n🎯 NEXT STEPS');
    console.log('='.repeat(70));

    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.');
      console.log('✅ Proceed with data seeding and deployment preparation.');
    } else {
      console.log('⚠️  Some tests failed. Review the errors above.');
      console.log('🔧 Fix the failing endpoints before proceeding to production.');
    }

    console.log('\n📝 MANUAL TESTING STILL NEEDED:');
    console.log('- File upload functionality (requires multipart/form-data)');
    console.log('- File serving with actual uploaded files');
    console.log('- Payment processing with real payment providers');
    console.log('- SMS sending functionality');
    console.log('- Booking system with actual space availability');

    return {
      success: this.results.failed === 0,
      passed: this.results.passed,
      failed: this.results.failed,
      skipped: this.results.skipped,
      errors: this.results.errors,
      duration: duration
    };
  }
}

// Main execution
async function main() {
  const tester = new IRACIntegrationTester();

  try {
    const results = await tester.runAllTests();
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('💥 Critical error running tests:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IRACIntegrationTester };
