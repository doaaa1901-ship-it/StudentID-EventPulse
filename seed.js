const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/user.model');
const Category = require('./models/category.model');
const Event = require('./models/event.model');
const Registration = require('./models/registration.model');
const Message = require('./models/message.model');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database for seeding...');

    // Clear collections in safe relational order
    await Message.deleteMany();
    await Registration.deleteMany();
    await Event.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing database records.');

    // Password Hashing
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventpulse.com',
      password: hashedPassword,
      role: 'admin'
    });

    const attendee1 = await User.create({
      name: 'Sarah Ahmed',
      email: 'sarah@example.com',
      password: hashedPassword,
      role: 'attendee'
    });

    const attendee2 = await User.create({
      name: 'Omar Hassan',
      email: 'omar@example.com',
      password: hashedPassword,
      role: 'attendee'
    });

    // Create Categories (3+)
    const techCategory = await Category.create({
      name: 'Technology',
      description: 'Software, AI, and developer conferences'
    });

    const musicCategory = await Category.create({
      name: 'Music',
      description: 'Live concerts and musical festivals'
    });

    const businessCategory = await Category.create({
      name: 'Business',
      description: 'Networking, startup pitch days, and marketing hubs'
    });

    // Create Events (4+)
    const event1 = await Event.create({
      title: 'Node.js Summit 2026',
      description: 'A comprehensive summit on backend architectures and scaling Express.',
      category: techCategory._id,
      date: new Date('2026-09-15T10:00:00Z'),
      city: 'Cairo',
      venue: 'Greek Campus Auditorium',
      capacity: 150,
      organizer: admin._id
    });

    const event2 = await Event.create({
      title: 'Jazz Night Festival',
      description: 'An evening featuring top local and international jazz artists.',
      category: musicCategory._id,
      date: new Date('2026-10-01T18:00:00Z'),
      city: 'Alexandria',
      venue: 'Bibliotheca Alexandrina',
      capacity: 300,
      organizer: admin._id
    });

    const event3 = await Event.create({
      title: 'Startup Pitch Expo',
      description: 'Watch 20 startups pitch live to top regional investors.',
      category: businessCategory._id,
      date: new Date('2026-11-20T09:00:00Z'),
      city: 'Cairo',
      venue: 'Nile Ritz-Carlton',
      capacity: 200,
      organizer: admin._id
    });

    const event4 = await Event.create({
      title: 'Cybersecurity Workshop',
      description: 'Hands-on practical workshop covering system defense and penetration testing.',
      category: techCategory._id,
      date: new Date('2026-12-05T14:00:00Z'),
      city: 'Giza',
      venue: 'Cairo University Hall',
      capacity: 50,
      organizer: admin._id
    });

    // Seed Registrations & Messages
    await Registration.create({
      event: event1._id,
      attendee: attendee1._id
    });

    await Message.create({
      event: event1._id,
      sender: admin._id,
      text: 'Welcome everyone! Check-in starts 30 minutes before the opening session.'
    });

    console.log('Database successfully seeded with categories, events, users, registrations, and messages!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during database seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();