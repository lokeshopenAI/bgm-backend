require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = 'admin@bgmsnacks.com';    // Set your admin email here
    const adminPhone = '9999999999';             // Optional: Admin phone
    const adminPassword = 'adminPassword123';   // Set your desired password

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      isAdmin: true,
      isVerified: true,  // Mark admin as verified
      otp: undefined,
      otpExpires: undefined,
    });

    await adminUser.save();
    console.log('Admin user created');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdminUser();
