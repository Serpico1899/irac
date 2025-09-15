#!/usr/bin/env node

/**
 * IRAC Project - Comprehensive Data Setup Script
 *
 * This script sets up comprehensive demo data for the IRAC project
 * covering all major systems that are 95% complete according to
 * the FINAL_CORRECTED_ANALYSIS.md
 *
 * Systems covered:
 * - User Management (Admin, Manager, Users)
 * - Scoring System (Points, Levels, Achievements)
 * - Product Store (Digital & Physical Products)
 * - Wallet System (Deposits, Purchases, Transactions)
 * - Referral System (Codes, Commissions)
 * - Booking System (Meeting rooms, Time slots)
 * - Content (Courses, Articles)
 * - Categories & Tags
 * - File Management
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8000';

class IRACDataSeeder {
  constructor() {
    this.tokens = {
      admin: null,
      manager: null,
      users: []
    };
    this.data = {
      users: [],
      categories: [],
      tags: [],
      products: [],
      courses: [],
      articles: [],
      referralCodes: []
    };
    this.stats = {
      created: 0,
      failed: 0,
      errors: []
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

      if (response.ok) {
        this.stats.created++;
        return { success: true, data: result };
      } else {
        this.stats.failed++;
        this.stats.errors.push({ endpoint, error: result });
        return { success: false, error: result };
      }
    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push({ endpoint, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createUsers() {
    console.log('\n👥 Creating Users...');

    // Create Admin User
    const adminData = {
      details: {
        set: {
          username: 'admin_irac',
          email: 'admin@irac.local',
          password: 'AdminPass123!',
          firstName: 'System',
          lastName: 'Administrator',
          mobile: '09101234567',
          role: 'admin',
          bio: 'System administrator for IRAC platform'
        }
      }
    };

    const adminResult = await this.makeRequest('user/createUser', 'POST', adminData);
    if (adminResult.success) {
      console.log('✅ Admin user created');

      // Login admin
      const adminLogin = await this.makeRequest('user/login', 'POST', {
        details: {
          set: {
            username: 'admin_irac',
            password: 'AdminPass123!'
          }
        }
      });

      if (adminLogin.success && adminLogin.data.token) {
        this.tokens.admin = adminLogin.data.token;
        console.log('✅ Admin logged in');
      }
    }

    // Create Manager User
    const managerData = {
      details: {
        set: {
          username: 'manager_irac',
          email: 'manager@irac.local',
          password: 'ManagerPass123!',
          firstName: 'Content',
          lastName: 'Manager',
          mobile: '09107654321',
          role: 'manager',
          bio: 'Content and operations manager'
        }
      }
    };

    const managerResult = await this.makeRequest('user/createUser', 'POST', managerData);
    if (managerResult.success) {
      console.log('✅ Manager user created');

      // Login manager
      const managerLogin = await this.makeRequest('user/login', 'POST', {
        details: {
          set: {
            username: 'manager_irac',
            password: 'ManagerPass123!'
          }
        }
      });

      if (managerLogin.success && managerLogin.data.token) {
        this.tokens.manager = managerLogin.data.token;
        console.log('✅ Manager logged in');
      }
    }

    // Create Regular Users
    const userProfiles = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        mobile: '09123456789',
        bio: 'Software developer interested in learning new technologies'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        mobile: '09123456788',
        bio: 'Marketing professional looking to expand skills'
      },
      {
        username: 'ali_rezaei',
        email: 'ali@example.com',
        firstName: 'Ali',
        lastName: 'Rezaei',
        mobile: '09123456787',
        bio: 'Student of computer science'
      },
      {
        username: 'sara_ahmadi',
        email: 'sara@example.com',
        firstName: 'Sara',
        lastName: 'Ahmadi',
        mobile: '09123456786',
        bio: 'Designer and creative professional'
      },
      {
        username: 'reza_karimi',
        email: 'reza@example.com',
        firstName: 'Reza',
        lastName: 'Karimi',
        mobile: '09123456785',
        bio: 'Business analyst and project manager'
      }
    ];

    for (let i = 0; i < userProfiles.length; i++) {
      const profile = userProfiles[i];
      const userData = {
        details: {
          set: {
            ...profile,
            password: 'UserPass123!',
            role: 'user'
          }
        }
      };

      const userResult = await this.makeRequest('user/createUser', 'POST', userData);
      if (userResult.success) {
        console.log(`✅ User ${profile.username} created`);
        this.data.users.push(userResult.data);

        // Login user and store token
        const userLogin = await this.makeRequest('user/login', 'POST', {
          details: {
            set: {
              username: profile.username,
              password: 'UserPass123!'
            }
          }
        });

        if (userLogin.success && userLogin.data.token) {
          this.tokens.users.push({
            user: userResult.data,
            token: userLogin.data.token
          });
        }
      }
    }

    console.log(`✅ Created ${this.data.users.length} regular users`);
  }

  async createCategoriesAndTags() {
    console.log('\n🏷️ Creating Categories and Tags...');

    if (!this.tokens.admin) {
      console.log('❌ No admin token, skipping categories');
      return;
    }

    // Categories
    const categories = [
      {
        name: 'Programming',
        description: 'Software development and programming courses'
      },
      {
        name: 'Design',
        description: 'Graphic design and UI/UX resources'
      },
      {
        name: 'Business',
        description: 'Business and entrepreneurship content'
      },
      {
        name: 'Marketing',
        description: 'Digital marketing and advertising'
      },
      {
        name: 'Data Science',
        description: 'Data analysis and machine learning'
      },
      {
        name: 'Mobile Development',
        description: 'iOS and Android development'
      }
    ];

    for (const category of categories) {
      const result = await this.makeRequest('category/createCategory', 'POST', {
        details: {
          set: {
            ...category,
            status: 'active'
          }
        }
      }, this.tokens.admin);

      if (result.success) {
        console.log(`✅ Category ${category.name} created`);
        this.data.categories.push(result.data);
      }
    }

    // Tags
    const tags = [
      'javascript', 'python', 'react', 'nodejs', 'typescript', 'vue', 'angular',
      'figma', 'photoshop', 'illustrator', 'sketch', 'ui-design', 'ux-research',
      'startup', 'finance', 'management', 'leadership', 'strategy',
      'seo', 'social-media', 'content-marketing', 'email-marketing',
      'machine-learning', 'artificial-intelligence', 'data-visualization',
      'ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin'
    ];

    for (const tagName of tags) {
      const result = await this.makeRequest('tag/createTag', 'POST', {
        details: {
          set: {
            name: tagName,
            description: `Tag for ${tagName} related content`,
            status: 'active'
          }
        }
      }, this.tokens.admin);

      if (result.success) {
        this.data.tags.push(result.data);
      }
    }

    console.log(`✅ Created ${this.data.tags.length} tags`);
  }

  async createProducts() {
    console.log('\n🛍️ Creating Products...');

    if (!this.tokens.admin || this.data.categories.length === 0) {
      console.log('❌ Missing admin token or categories, skipping products');
      return;
    }

    const products = [
      {
        name: 'Complete JavaScript Course Bundle',
        description: 'Comprehensive JavaScript learning package with 50+ hours of video content',
        price: 299.99,
        type: 'digital',
        inventory_count: 1000,
        categoryId: this.data.categories[0]._id // Programming
      },
      {
        name: 'React.js Masterclass',
        description: 'Master React.js with hands-on projects and real-world applications',
        price: 199.99,
        type: 'digital',
        inventory_count: 1000,
        categoryId: this.data.categories[0]._id
      },
      {
        name: 'UI/UX Design Toolkit',
        description: 'Professional design resources and templates for modern interfaces',
        price: 149.99,
        type: 'digital',
        inventory_count: 500,
        categoryId: this.data.categories[1]._id // Design
      },
      {
        name: 'Business Strategy Playbook',
        description: 'Strategic planning guide with templates and case studies',
        price: 89.99,
        type: 'digital',
        inventory_count: 300,
        categoryId: this.data.categories[2]._id // Business
      },
      {
        name: 'Digital Marketing Essentials',
        description: 'Complete guide to modern digital marketing strategies',
        price: 179.99,
        type: 'digital',
        inventory_count: 400,
        categoryId: this.data.categories[3]._id // Marketing
      },
      {
        name: 'Python Data Science Kit',
        description: 'Data science tools and libraries guide for Python developers',
        price: 249.99,
        type: 'digital',
        inventory_count: 600,
        categoryId: this.data.categories[4]._id // Data Science
      },
      {
        name: 'IRAC Branded Notebook',
        description: 'High-quality notebook with IRAC branding for note-taking',
        price: 29.99,
        type: 'physical',
        inventory_count: 100,
        categoryId: this.data.categories[2]._id
      },
      {
        name: 'Premium Coding Stickers Pack',
        description: 'Set of 50 premium coding-themed stickers',
        price: 19.99,
        type: 'physical',
        inventory_count: 200,
        categoryId: this.data.categories[0]._id
      }
    ];

    for (const product of products) {
      const result = await this.makeRequest('product/createProduct', 'POST', {
        details: {
          set: {
            ...product,
            status: 'active'
          }
        }
      }, this.tokens.admin);

      if (result.success) {
        console.log(`✅ Product ${product.name} created`);
        this.data.products.push(result.data);
      }
    }
  }

  async createCourses() {
    console.log('\n🎓 Creating Courses...');

    if (!this.tokens.admin) {
      console.log('❌ No admin token, skipping courses');
      return;
    }

    const courses = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript from basics to advanced concepts',
        level: 'beginner',
        price: 99.99,
        duration: 40,
        status: 'published'
      },
      {
        title: 'Advanced React Development',
        description: 'Master React with hooks, context, and advanced patterns',
        level: 'advanced',
        price: 199.99,
        duration: 60,
        status: 'published'
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Design beautiful and functional user interfaces',
        level: 'intermediate',
        price: 149.99,
        duration: 35,
        status: 'published'
      },
      {
        title: 'Python for Data Science',
        description: 'Analyze data and build machine learning models with Python',
        level: 'intermediate',
        price: 179.99,
        duration: 50,
        status: 'published'
      },
      {
        title: 'Digital Marketing Mastery',
        description: 'Complete digital marketing course with practical examples',
        level: 'beginner',
        price: 129.99,
        duration: 45,
        status: 'published'
      }
    ];

    for (const course of courses) {
      const result = await this.makeRequest('course/createCourse', 'POST', {
        details: {
          set: course
        }
      }, this.tokens.admin);

      if (result.success) {
        console.log(`✅ Course ${course.title} created`);
        this.data.courses.push(result.data);
      }
    }
  }

  async setupWalletsAndScoring() {
    console.log('\n💰 Setting up Wallets and Scoring...');

    if (!this.tokens.admin) {
      console.log('❌ No admin token, skipping wallet setup');
      return;
    }

    // Add funds to user wallets and create scoring activities
    for (let i = 0; i < this.tokens.users.length; i++) {
      const userToken = this.tokens.users[i];

      // Deposit initial funds (Admin action)
      const depositAmount = Math.floor(Math.random() * 1000) + 500; // 500-1500
      await this.makeRequest('wallet/deposit', 'POST', {
        details: {
          set: {
            amount: depositAmount,
            description: 'Welcome bonus deposit',
            userId: userToken.user._id
          }
        }
      }, this.tokens.admin);

      // Create scoring activities
      const activities = [
        { points: 50, type: 'profile_completion', desc: 'Profile completion bonus' },
        { points: 30, type: 'first_login', desc: 'First login reward' },
        { points: 25, type: 'email_verification', desc: 'Email verification bonus' },
        { points: 20, type: 'tutorial_completion', desc: 'Tutorial completion reward' }
      ];

      for (const activity of activities) {
        await this.makeRequest('scoring/addPoints', 'POST', {
          details: {
            set: {
              points: activity.points,
              activity_type: activity.type,
              description: activity.desc
            }
          }
        }, userToken.token);
      }

      // Daily login for random days
      const loginDays = Math.floor(Math.random() * 10) + 1;
      for (let day = 0; day < loginDays; day++) {
        await this.makeRequest('scoring/dailyLogin', 'POST', {
          details: { set: {}, get: {} }
        }, userToken.token);
      }

      console.log(`✅ Setup wallet and scoring for user ${i + 1}`);
    }
  }

  async createReferrals() {
    console.log('\n🤝 Setting up Referral System...');

    // Generate referral codes for users
    for (let i = 0; i < this.tokens.users.length; i++) {
      const userToken = this.tokens.users[i];

      const result = await this.makeRequest('referral/generateCode', 'POST', {
        details: { set: {}, get: {} }
      }, userToken.token);

      if (result.success) {
        this.data.referralCodes.push({
          user: userToken.user,
          code: result.data.code
        });
      }
    }

    console.log(`✅ Generated ${this.data.referralCodes.length} referral codes`);
  }

  async createPurchases() {
    console.log('\n🛒 Creating Sample Purchases...');

    if (this.data.products.length === 0) {
      console.log('❌ No products available, skipping purchases');
      return;
    }

    // Create purchases for some users
    for (let i = 0; i < Math.min(3, this.tokens.users.length); i++) {
      const userToken = this.tokens.users[i];

      // Buy 1-2 random products
      const purchaseCount = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < purchaseCount; j++) {
        const randomProduct = this.data.products[Math.floor(Math.random() * this.data.products.length)];

        await this.makeRequest('wallet/purchase', 'POST', {
          details: {
            set: {
              productId: randomProduct._id,
              quantity: 1
            }
          }
        }, userToken.token);
      }

      console.log(`✅ Created purchases for user ${i + 1}`);
    }
  }

  async createBookings() {
    console.log('\n📅 Creating Sample Bookings...');

    // Create bookings for first few users
    for (let i = 0; i < Math.min(3, this.tokens.users.length); i++) {
      const userToken = this.tokens.users[i];

      // Get available slots
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const slotsResult = await this.makeRequest('booking/getAvailableSlots', 'POST', {
        details: {
          set: {
            date: dateStr,
            spaceType: 'meeting_room'
          }
        }
      }, userToken.token);

      if (slotsResult.success && slotsResult.data.slots && slotsResult.data.slots.length > 0) {
        // Book a random available slot
        const randomSlot = slotsResult.data.slots[Math.floor(Math.random() * slotsResult.data.slots.length)];

        await this.makeRequest('booking/createBooking', 'POST', {
          details: {
            set: {
              spaceType: 'meeting_room',
              date: dateStr,
              timeSlot: randomSlot,
              duration: 2,
              purpose: `Meeting for user ${userToken.user.firstName}`
            }
          }
        }, userToken.token);

        console.log(`✅ Created booking for user ${i + 1}`);
      }
    }
  }

  async enrollInCourses() {
    console.log('\n📚 Creating Course Enrollments...');

    if (this.data.courses.length === 0) {
      console.log('❌ No courses available, skipping enrollments');
      return;
    }

    // Enroll users in random courses
    for (let i = 0; i < this.tokens.users.length; i++) {
      const userToken = this.tokens.users[i];

      // Enroll in 1-3 random courses
      const enrollmentCount = Math.floor(Math.random() * 3) + 1;
      const enrolledCourses = new Set();

      for (let j = 0; j < enrollmentCount && enrolledCourses.size < this.data.courses.length; j++) {
        const randomCourse = this.data.courses[Math.floor(Math.random() * this.data.courses.length)];

        if (!enrolledCourses.has(randomCourse._id)) {
          await this.makeRequest('course/enrollCourse', 'POST', {
            details: {
              set: {
                courseId: randomCourse._id
              }
            }
          }, userToken.token);

          enrolledCourses.add(randomCourse._id);
        }
      }

      console.log(`✅ Enrolled user ${i + 1} in ${enrolledCourses.size} courses`);
    }
  }

  async generateAnalyticsData() {
    console.log('\n📊 Generating Analytics Data...');

    if (!this.tokens.admin) {
      console.log('❌ No admin token, skipping analytics generation');
      return;
    }

    // Trigger analytics calculation
    await this.makeRequest('analytics/getUserAnalytics', 'POST', {
      details: {
        set: { timeframe: 'month' }
      }
    }, this.tokens.admin);

    console.log('✅ Analytics data generated');
  }

  async runDataSetup() {
    console.log('🚀 Starting IRAC Comprehensive Data Setup');
    console.log('==========================================');

    const startTime = Date.now();

    try {
      // Initial seeding via admin endpoint
      console.log('\n🌱 Running Initial Database Seeding...');
      await this.makeRequest('admin/seedDatabase', 'POST', {
        includeUsers: false, // We'll create custom users
        clearExisting: false
      });

      // Core data setup
      await this.createUsers();
      await this.createCategoriesAndTags();
      await this.createProducts();
      await this.createCourses();

      // User activity simulation
      await this.setupWalletsAndScoring();
      await this.createReferrals();
      await this.createPurchases();
      await this.createBookings();
      await this.enrollInCourses();

      // Analytics
      await this.generateAnalyticsData();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Print summary
      console.log('\n✅ DATA SETUP COMPLETED SUCCESSFULLY!');
      console.log('=====================================');
      console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
      console.log(`✅ Successfully created: ${this.stats.created} items`);
      console.log(`❌ Failed operations: ${this.stats.failed}`);

      console.log('\n📊 DATA SUMMARY:');
      console.log(`👥 Users: ${this.data.users.length + 2} (+ 1 admin, 1 manager)`); // +2 for admin and manager
      console.log(`🏷️  Categories: ${this.data.categories.length}`);
      console.log(`🔖 Tags: ${this.data.tags.length}`);
      console.log(`🛍️  Products: ${this.data.products.length}`);
      console.log(`🎓 Courses: ${this.data.courses.length}`);
      console.log(`🤝 Referral Codes: ${this.data.referralCodes.length}`);

      console.log('\n🔐 TEST ACCOUNTS:');
      console.log('================');
      console.log('👑 Admin: admin_irac / AdminPass123!');
      console.log('👤 Manager: manager_irac / ManagerPass123!');
      console.log('👥 Users: john_doe, jane_smith, ali_rezaei, sara_ahmadi, reza_karimi / UserPass123!');

      console.log('\n🎯 READY FOR TESTING:');
      console.log('====================');
      console.log('• All major systems have sample data');
      console.log('• Users have wallet balances and scoring points');
      console.log('• Products and courses are available for purchase');
      console.log('• Referral codes are generated');
      console.log('• Sample bookings and enrollments created');
      console.log('• System is ready for comprehensive testing');

      if (this.stats.failed > 0) {
        console.log('\n⚠️  WARNINGS:');
        console.log(`${this.stats.failed} operations failed. Check the details below:`);
        this.stats.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.endpoint}: ${JSON.stringify(error.error)}`);
        });
      }

      return {
        success: this.stats.failed === 0,
        created: this.stats.created,
        failed: this.stats.failed,
        duration: duration
      };

    } catch (error) {
      console.error('💥 Critical error during data setup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Main execution
async function main() {
  const seeder = new IRACDataSeeder();

  try {
    const result = await seeder.runDataSetup();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('💥 Failed to run data setup:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IRACDataSeeder };
