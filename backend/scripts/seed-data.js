/**
 * SEED SCRIPT - Populate Database with Sample Issues
 * 
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Update connection string if needed in config/db.js
 * 3. Run: node backend/scripts/seed-data.js
 * 
 * What it does:
 * - Creates sample issues with different statuses
 * - Uses mock user IDs and locations
 * - Perfect for development and testing
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Issue = require('../models/Issue');
const db = require('../config/db');

// Sample issues data
const sampleIssues = [
  {
    category: 'Infrastructure',
    severity: 4,
    status: 'in-progress',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041],
      address: 'Block C, Main Road'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Broken street light',
    description: 'Street light in Block C main entrance is not working',
    upvotes: 5,
    upvotedBy: [
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439013')
    ]
  },
  {
    category: 'Sanitation',
    severity: 5,
    status: 'pending',
    location: {
      type: 'Point',
      coordinates: [77.1045, 28.7051],
      address: 'Near Main Canteen'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Garbage overflow',
    description: 'Garbage bins are overflowing near the main canteen',
    upvotes: 12,
    upvotedBy: Array.from({ length: 12 }, (_, i) =>
      new mongoose.Types.ObjectId('507f1f77bcf86cd79943901' + (i + 2))
    )
  },
  {
    category: 'Roads',
    severity: 3,
    status: 'resolved',
    location: {
      type: 'Point',
      coordinates: [77.1015, 28.7061],
      address: 'Main Road entrance'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Pothole on Main Road',
    description: 'Large pothole near main road entrance',
    upvotes: 8,
    upvotedBy: Array.from({ length: 8 }, (_, i) =>
      new mongoose.Types.ObjectId('507f1f77bcf86cd79943901' + (i + 14))
    )
  },
  {
    category: 'Utilities',
    severity: 2,
    status: 'pending',
    location: {
      type: 'Point',
      coordinates: [77.1055, 28.7031],
      address: 'Hostel Block B'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Water leakage',
    description: 'Water leaking from pipe in Hostel Block B basement',
    upvotes: 3,
    upvotedBy: [
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439023')
    ]
  },
  {
    category: 'Infrastructure',
    severity: 2,
    status: 'pending',
    location: {
      type: 'Point',
      coordinates: [77.1035, 28.7071],
      address: 'Corridor near Auditorium'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    title: 'Loose ceiling panel',
    description: 'Ceiling panel in corridor near auditorium is loose',
    upvotes: 1,
    upvotedBy: [new mongoose.Types.ObjectId('507f1f77bcf86cd799439024')]
  },
  {
    category: 'Sanitation',
    severity: 3,
    status: 'in-progress',
    location: {
      type: 'Point',
      coordinates: [77.1005, 28.7021],
      address: 'Sports Ground'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    title: 'Dirty sports ground',
    description: 'Sports ground needs cleaning urgently',
    upvotes: 7,
    upvotedBy: Array.from({ length: 7 }, (_, i) =>
      new mongoose.Types.ObjectId('507f1f77bcf86cd79943902' + (i + 5))
    )
  },
  {
    category: 'Animal Welfare',
    severity: 4,
    status: 'pending',
    location: {
      type: 'Point',
      coordinates: [77.1065, 28.7011],
      address: 'Gate Area'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    title: 'Injured stray dog',
    description: 'An injured stray dog near the main gate needs help',
    upvotes: 15,
    upvotedBy: Array.from({ length: 15 }, (_, i) =>
      new mongoose.Types.ObjectId('507f1f77bcf86cd79943903' + (i + 1))
    )
  },
  {
    category: 'Health & Hygiene',
    severity: 3,
    status: 'pending',
    location: {
      type: 'Point',
      coordinates: [77.1075, 28.7041],
      address: 'Medical Stop'
    },
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    title: 'Unhygienic conditions',
    description: 'Medical stop has unhygienic conditions',
    upvotes: 4,
    upvotedBy: [
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
      new mongoose.Types.ObjectId('507f1f77bcf86cd799439033')
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              DATABASE SEEDING SCRIPT v1.0                   ║');
    console.log('║                                                            ║');
    console.log('║  Populating database with sample issues for testing        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/jansevak', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing issues
    console.log('🗑️  Clearing existing issues...');
    const deletedCount = await Issue.deleteMany({});
    console.log(`✅ Deleted ${deletedCount.deletedCount} existing issues\n`);

    // Insert sample issues
    console.log('📝 Inserting sample issues...');
    const insertedIssues = await Issue.insertMany(sampleIssues);
    console.log(`✅ Successfully inserted ${insertedIssues.length} sample issues\n`);

    // Display summary
    console.log('═'.repeat(60));
    console.log('SEEDED ISSUES SUMMARY');
    console.log('═'.repeat(60));

    const stats = {
      total: insertedIssues.length,
      byCategory: {},
      byStatus: {},
      totalUpvotes: 0
    };

    insertedIssues.forEach((issue) => {
      // Count by category
      stats.byCategory[issue.category] = (stats.byCategory[issue.category] || 0) + 1;

      // Count by status
      stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;

      // Total upvotes
      stats.totalUpvotes += issue.upvotes;
    });

    console.log(`\n📊 Total Issues: ${stats.total}`);

    console.log('\n📂 By Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n📋 By Status:');
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log(`\n👍 Total Upvotes: ${stats.totalUpvotes}`);

    console.log('\n' + '═'.repeat(60));
    console.log('SAMPLE DATA FOR TESTING');
    console.log('═'.repeat(60));

    console.log(`\nTest User ID: 507f1f77bcf86cd799439011`);
    console.log(
      `\nYou can now test the APIs:\n` +
      `  • GET /api/issues/stats → View aggregate statistics\n` +
      `  • GET /api/issues/user/507f1f77bcf86cd799439011 → View user issues\n` +
      `  • POST /api/issues/{id}/upvote → Upvote an issue\n` +
      `  • GET /api/heatmap → View heatmap GeoJSON\n`
    );

    console.log('═'.repeat(60));
    console.log('\n🎉 Database seeding completed successfully!\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error seeding database:', err);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
