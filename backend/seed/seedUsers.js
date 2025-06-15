const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Test users data
const usersData = [
  {
    nom: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    site: 'Siège',
    status: 'actif'
  },
  {
    nom: 'Manager User',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Manager',
    site: 'Tunis Centre',
    status: 'actif'
  },
  {
    nom: 'Technicien User',
    email: 'tech@example.com',
    password: 'password123',
    role: 'Technicien',
    site: 'Sfax Nord',
    status: 'actif'
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing users (except any you want to keep)
      // Be careful with this in production!
      await User.deleteMany({
        email: { $in: usersData.map(user => user.email) }
      });
      console.log('Cleared existing test users');
      
      // Hash passwords and create users
      const hashedUsers = await Promise.all(
        usersData.map(async (user) => {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          return {
            ...user,
            password: hashedPassword
          };
        })
      );
      
      // Insert users
      const users = await User.insertMany(hashedUsers);
      console.log(`${users.length} users inserted successfully`);
      
      // Print user emails and roles for reference
      users.forEach(user => {
        console.log(`Created user: ${user.email} (${user.role})`);
      });
      
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error seeding users:', error);
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 