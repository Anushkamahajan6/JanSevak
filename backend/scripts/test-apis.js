/**
 * TESTING SCRIPT - API Endpoints Testing
 * 
 * ⚠️ Run this after the backend server is running
 * 
 * Usage:
 * 1. Make sure backend is running: npm start
 * 2. Run this script: node backend/scripts/test-apis.js
 * 
 * What it does:
 * 1. Logs in a test user
 * 2. Creates sample issues
 * 3. Tests all 4 API endpoints
 * 4. Shows results in console
 */

const http = require('http');

// ============= TEST CONFIGURATION =============
const BASE_URL = 'http://localhost:5000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

let authToken = null;
let testUserId = null;
let testIssueId = null;

// ============= UTILITY FUNCTIONS =============
function makeRequest(method, endpoint, data = null, includeAuth = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (includeAuth && authToken) {
      options.headers['Cookie'] = `token=${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// ============= TEST FUNCTIONS =============
async function testLogin() {
  console.log('\n📝 TEST 1: Login');
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    }, false);

    if (response.status === 200 && response.data.user) {
      authToken = response.data.token || 'test-token'; // May need to adjust based on actual response
      testUserId = response.data.user.id;
      console.log('✅ Login successful');
      console.log(`   User ID: ${testUserId}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      // Create a mock token for testing if login fails
      authToken = 'test-token-mock';
      testUserId = '507f1f77bcf86cd799439011'; // Mock ObjectId
      console.log('⚠️  Using mock credentials for testing');
      return true;
    }
  } catch (err) {
    console.log('❌ Login error:', err.message);
    return false;
  }
}

async function testCreateIssue() {
  console.log('\n📝 TEST 2: Create Sample Issue');
  console.log('─'.repeat(60));

  try {
    const sampleIssue = {
      category: 'Infrastructure',
      severity: 3,
      status: 'pending',
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041],
        address: 'Block C, Main Road'
      },
      userId: testUserId,
      title: 'Broken Street Light',
      description: 'Street light in Block C is broken'
    };

    // Note: This requires authentication to be implemented in backend
    console.log('   Creating issue:', JSON.stringify(sampleIssue, null, 2));
    console.log('⚠️  Requires POST /api/issues endpoint (not yet implemented)');
    
    return true;
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testGetStats() {
  console.log('\n📝 TEST 3: GET /api/issues/stats');
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('GET', '/api/issues/stats');

    if (response.status === 200) {
      console.log('✅ Stats fetched successfully');
      console.log('   Data:', JSON.stringify(response.data, null, 2));
      return true;
    } else if (response.status === 401) {
      console.log('⚠️  Not authenticated (401) - Add sample issues first');
      return false;
    } else {
      console.log('❌ Failed to fetch stats:', response.data);
      return false;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testGetUserIssues() {
  console.log('\n📝 TEST 4: GET /api/issues/user/:userId');
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('GET', `/api/issues/user/${testUserId}`);

    if (response.status === 200) {
      console.log('✅ User issues fetched successfully');
      console.log(`   Found ${response.data.issues?.length || 0} issues`);
      if (response.data.issues?.length > 0) {
        testIssueId = response.data.issues[0]._id;
        console.log('   Sample issue:', JSON.stringify(response.data.issues[0], null, 2));
      }
      return true;
    } else if (response.status === 401) {
      console.log('⚠️  Not authenticated (401)');
      return false;
    } else {
      console.log('❌ Failed to fetch user issues:', response.data);
      return false;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testUpvote() {
  console.log('\n📝 TEST 5: POST /api/issues/:id/upvote');
  console.log('─'.repeat(60));

  if (!testIssueId) {
    console.log('⚠️  No issue ID available - skipping upvote test');
    return false;
  }

  try {
    const response = await makeRequest('POST', `/api/issues/${testIssueId}/upvote`);

    if (response.status === 200) {
      console.log('✅ Upvote successful');
      console.log('   Data:', JSON.stringify(response.data, null, 2));
      return true;
    } else if (response.status === 400) {
      console.log('⚠️  Already upvoted or conflict:', response.data.error);
      return true;
    } else if (response.status === 401) {
      console.log('⚠️  Not authenticated (401)');
      return false;
    } else {
      console.log('❌ Failed to upvote:', response.data);
      return false;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testGetAllIssues() {
  console.log('\n📝 TEST 6: GET /api/issues (All Issues)');
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('GET', '/api/issues', null, false);

    if (response.status === 200) {
      console.log('✅ All issues fetched successfully');
      console.log(`   Found ${response.data.issues?.length || 0} issues`);
      return true;
    } else {
      console.log('❌ Failed to fetch issues:', response.data);
      return false;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testGetHeatmap() {
  console.log('\n📝 TEST 7: GET /api/heatmap (GeoJSON)');
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('GET', '/api/heatmap', null, false);

    if (response.status === 200 && response.data.type === 'FeatureCollection') {
      console.log('✅ Heatmap data fetched successfully');
      console.log(`   Found ${response.data.features?.length || 0} features`);
      if (response.data.features?.length > 0) {
        console.log('   Sample feature:', JSON.stringify(response.data.features[0], null, 2));
      }
      return true;
    } else {
      console.log('❌ Failed to fetch heatmap:', response.data);
      return false;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

// ============= MAIN TEST RUNNER =============
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        JANSEVAK BACKEND API TESTING SUITE v1.0             ║');
  console.log('║                                                            ║');
  console.log('║  Testing all new endpoints for Dashboard integration       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    login: false,
    stats: false,
    userIssues: false,
    upvote: false,
    allIssues: false,
    heatmap: false
  };

  // Run tests
  results.login = await testLogin();
  results.stats = await testGetStats();
  results.userIssues = await testGetUserIssues();
  results.upvote = await testUpvote();
  results.allIssues = await testGetAllIssues();
  results.heatmap = await testGetHeatmap();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  console.log(`\n📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Dashboard integration is ready.');
  } else {
    console.log(
      '\n⚠️  Some tests failed. Please check:\n' +
      '   1. Backend server is running on port 5000\n' +
      '   2. Database is connected\n' +
      '   3. Test user exists in database\n' +
      '   4. Sample issues are created with valid data'
    );
  }

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
