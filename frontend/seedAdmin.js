import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

const seedAdmin = async () => {
  try {
    const mongoUrl = process.env.LOCAL_DB === 'true'
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL;

    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@mywearables.com' });

    if (adminExists) {
      console.log('! Admin user already exists');
      process.exit();
    }

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@mywearables.com',
      password: 'adminpassword123',
      role: 'admin',
    });

    if (adminUser) {
      console.log('✓ Admin user seeded successfully');
      console.log('Email: admin@mywearables.com');
      console.log('Password: adminpassword123');
    }

    process.exit();
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
