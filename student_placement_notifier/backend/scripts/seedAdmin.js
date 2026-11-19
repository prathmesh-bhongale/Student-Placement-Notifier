require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const ensureAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@placement.com').toLowerCase();
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${email}`);
    return existing;
  }
  const admin = await Admin.create({
    name: process.env.ADMIN_NAME || 'TPO Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  });
  console.log(`✅ Admin created: ${email}`);
  return admin;
};

module.exports = { ensureAdmin };

// Run directly: node scripts/seedAdmin.js
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementNotifierDB', {
        serverSelectionTimeoutMS: 8000,
      });
      await ensureAdmin();
    } catch (e) {
      console.error('❌ Seed failed:', e.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}
