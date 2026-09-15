import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Menu from './models/Menu.js';
import User from './models/User.js';
import Notification from './models/Notification.js';
import Complaint from './models/Complaint.js';
import Feedback from './models/Feedback.js';
import OptOut from './models/OptOut.js';

dotenv.config();

const seedData = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/messify';
    if (uri.includes('<db_password>')) {
      console.warn('⚠️ MONGO_URI has placeholder <db_password>, falling back to local mongodb://127.0.0.1:27017/messify for seed.');
      uri = 'mongodb://127.0.0.1:27017/messify';
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Menu.deleteMany({});
    await Notification.deleteMany({});
    await Complaint.deleteMany({});
    await Feedback.deleteMany({});
    await OptOut.deleteMany({});
    console.log('🗑️  Cleared existing menus, notifications, complaints, feedbacks, and opt-outs');

    // Seed weekly menu
    const menuData = [
      // Monday
      { day: 'monday', mealType: 'breakfast', items: ['Poha', 'Boiled Eggs', 'Tea', 'Bread & Butter'], price: 35 },
      { day: 'monday', mealType: 'lunch', items: ['Rice', 'Dal Tadka', 'Aloo Gobi', 'Roti', 'Salad'], price: 65 },
      { day: 'monday', mealType: 'snacks', items: ['Samosa', 'Masala Tea'], price: 20 },
      { day: 'monday', mealType: 'dinner', items: ['Jeera Rice', 'Rajma Masala', 'Mix Veg', 'Roti', 'Kheer'], price: 65 },
      // Tuesday
      { day: 'tuesday', mealType: 'breakfast', items: ['Idli Sambhar', 'Coconut Chutney', 'Filter Coffee', 'Banana'], price: 35 },
      { day: 'tuesday', mealType: 'lunch', items: ['Rice', 'Arhar Dal', 'Paneer Butter Masala', 'Roti', 'Boondi Raita'], price: 70 },
      { day: 'tuesday', mealType: 'snacks', items: ['Bread Pakora', 'Ginger Tea'], price: 20 },
      { day: 'tuesday', mealType: 'dinner', items: ['Rice', 'Chana Dal', 'Bhindi Fry', 'Roti', 'Gulab Jamun'], price: 65 },
      // Wednesday
      { day: 'wednesday', mealType: 'breakfast', items: ['Aloo Paratha', 'Fresh Curd', 'Tea', 'Lemon Pickle'], price: 40 },
      { day: 'wednesday', mealType: 'lunch', items: ['Pulao', 'Moong Dal', 'Amritsari Chole', 'Bhature/Roti', 'Salad'], price: 65 },
      { day: 'wednesday', mealType: 'snacks', items: ['Veg Cutlet', 'Green Chutney', 'Coffee'], price: 25 },
      { day: 'wednesday', mealType: 'dinner', items: ['Rice', 'Dal Makhani', 'Egg Curry / Kadhai Paneer', 'Butter Roti', 'Ice Cream'], price: 75 },
      // Thursday
      { day: 'thursday', mealType: 'breakfast', items: ['Chole Bhature', 'Tea', 'Sweet Lassi'], price: 45 },
      { day: 'thursday', mealType: 'lunch', items: ['Rice', 'Masoor Dal', 'Kadai Paneer', 'Roti', 'Cucumber Salad'], price: 70 },
      { day: 'thursday', mealType: 'snacks', items: ['Masala Maggi', 'Hot Chai'], price: 20 },
      { day: 'thursday', mealType: 'dinner', items: ['Hyderabadi Dum Biryani', 'Burani Raita', 'Chicken Curry / Shahi Paneer', 'Gulab Jamun'], price: 80 },
      // Friday
      { day: 'friday', mealType: 'breakfast', items: ['Rava Upma', 'Boiled Eggs / Sprouts', 'Tea', 'Seasonal Fruits'], price: 35 },
      { day: 'friday', mealType: 'lunch', items: ['Rice', 'Toor Dal', 'Matar Paneer', 'Tandoori Roti', 'Pickle'], price: 65 },
      { day: 'friday', mealType: 'snacks', items: ['Mumbai Pav Bhaji', 'Chai'], price: 30 },
      { day: 'friday', mealType: 'dinner', items: ['Rice', 'Dal Fry', 'Aloo Dum', 'Roti', 'Moong Dal Halwa'], price: 65 },
      // Saturday
      { day: 'saturday', mealType: 'breakfast', items: ['Bedmi Puri Sabji', 'Tea', 'Banana'], price: 40 },
      { day: 'saturday', mealType: 'lunch', items: ['Jeera Rice', 'Chana Dal', 'Shahi Paneer', 'Roti', 'Kachumber Salad'], price: 70 },
      { day: 'saturday', mealType: 'snacks', items: ['Crispy Spring Roll', 'Cappuccino'], price: 25 },
      { day: 'saturday', mealType: 'dinner', items: ['Fried Rice', 'Veg Manchurian / Chilli Chicken', 'Hakka Noodles', 'Rasmalai'], price: 80 },
      // Sunday
      { day: 'sunday', mealType: 'breakfast', items: ['Stuffed Paneer Paratha', 'Curd', 'Tea', 'Mix Fruit Juice'], price: 45 },
      { day: 'sunday', mealType: 'lunch', items: ['Special Feast Biryani', 'Chicken Curry / Malai Kofta', 'Pineapple Raita', 'Gulab Jamun'], price: 85 },
      { day: 'sunday', mealType: 'snacks', items: ['Red Sauce Pasta', 'Iced Tea'], price: 30 },
      { day: 'sunday', mealType: 'dinner', items: ['Steamed Rice', 'Dal Tadka', 'Butter Chicken / Paneer Lababdar', 'Garlic Naan', 'Matka Kulfi'], price: 80 },
    ];

    await Menu.insertMany(menuData);
    console.log(`🍽️  Seeded ${menuData.length} menu entries`);

    // Seed sample notifications
    const notificationData = [
      {
        title: 'Mess Fee Rebate System Active',
        message: 'Your ₹25,000 semester mess fee rebate system is now online! Opt out of meals 2 hours prior to save up to ₹70/meal.',
        type: 'alert'
      },
      {
        title: 'Sunday Special Feast Announced',
        message: 'This Sunday dinner features Butter Chicken, Paneer Lababdar, Garlic Naan and Matka Kulfi. Check timings in the menu!',
        type: 'menu'
      },
      {
        title: 'Complaints & Hygiene Portal Online',
        message: 'Students can now lodge complaints regarding food quality, cleanliness or staff behavior and track resolution status in real-time.',
        type: 'announcement'
      }
    ];

    await Notification.insertMany(notificationData);
    console.log(`🔔 Seeded ${notificationData.length} notifications`);

    // Clear existing users to ensure clean fresh hash
    await User.deleteMany({});

    // Create worker account
    const worker = await User.create({
      name: 'Ramesh Sharma (Head Chef)',
      email: 'messworker@mnnit.ac.in',
      password: 'worker1234',
      role: 'worker',
      phone: '9876543210',
      hostel: 'SVBH Mess Kitchen'
    });
    console.log('👷 Created worker account: messworker@mnnit.ac.in / worker1234');

    // Create admin account
    const admin = await User.create({
      name: 'Dr. A. K. Verma (Mess Warden)',
      email: 'admin@mnnit.ac.in',
      password: 'admin1234',
      role: 'admin',
      phone: '9876543211',
      hostel: 'Warden Office'
    });
    console.log('🔑 Created admin account: admin@mnnit.ac.in / admin1234');

    // Create student accounts
    const student1 = await User.create({
      name: 'Yatharth Prajapati',
      email: 'student@mnnit.ac.in',
      password: 'student1234',
      role: 'student',
      regNo: '20224050',
      branch: 'Computer Science and Engineering',
      phone: '9123456780',
      hostel: 'SVBH',
      roomNo: 'A-214',
      dietaryPreference: 'Veg',
      allergies: 'None',
      verificationStatus: 'approved',
      isVerified: true,
      semesterFee: 25000,
      annualFee: 50000
    });

    const student2 = await User.create({
      name: 'Rohit Kumar',
      email: 'rohit.kumar@mnnit.ac.in',
      password: 'student1234',
      role: 'student',
      regNo: '20224099',
      branch: 'Electronics and Communication',
      phone: '9876501234',
      hostel: 'SVBH',
      roomNo: 'B-108',
      dietaryPreference: 'Non-Veg',
      allergies: 'Peanuts',
      verificationStatus: 'approved',
      isVerified: true,
      semesterFee: 25000,
      annualFee: 50000
    });

    const student3 = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@mnnit.ac.in',
      password: 'student1234',
      role: 'student',
      regNo: '20235012',
      branch: 'Information Technology',
      phone: '9811223344',
      hostel: 'KNGH',
      roomNo: 'C-302',
      dietaryPreference: 'Jain',
      allergies: 'Lactose intolerant',
      verificationStatus: 'pending',
      isVerified: false,
      semesterFee: 25000,
      annualFee: 50000
    });

    console.log('🎓 Seeded sample student accounts');

    // Seed Sample Complaints
    await Complaint.create([
      {
        student: student1._id,
        studentName: student1.name,
        studentEmail: student1.email,
        regNo: student1.regNo,
        hostel: student1.hostel,
        roomNo: student1.roomNo,
        category: 'Food Quality',
        subject: 'Dal was watery in Tuesday Dinner',
        description: 'The Chana Dal served on Tuesday dinner was very dilute with low spices. Kindly request the kitchen team to maintain standard thickness.',
        mealType: 'dinner',
        mealDate: new Date(Date.now() - 24 * 3600 * 1000),
        urgency: 'medium',
        status: 'resolved',
        adminResponse: 'Checked with kitchen team. The cook has been instructed to adhere to the standard recipe with proper proportion.',
        resolvedByName: 'Ramesh Sharma (Head Chef)',
        resolvedAt: new Date()
      },
      {
        student: student2._id,
        studentName: student2.name,
        studentEmail: student2.email,
        regNo: student2.regNo,
        hostel: student2.hostel,
        roomNo: student2.roomNo,
        category: 'Hygiene & Cleanliness',
        subject: 'Water dispenser filter replacement needed',
        description: 'The RO water dispenser near SVBH second floor dining hall has yellow indicator on. Please service filter.',
        mealType: 'general',
        mealDate: new Date(),
        urgency: 'high',
        status: 'in-progress',
        adminResponse: 'Maintenance team notified. Technician will service the RO unit by 4 PM today.',
        resolvedByName: 'Dr. A. K. Verma (Mess Warden)'
      },
      {
        student: student1._id,
        studentName: student1.name,
        studentEmail: student1.email,
        regNo: student1.regNo,
        hostel: student1.hostel,
        roomNo: student1.roomNo,
        category: 'Billing & Mess Fee',
        subject: 'Opt-out refund calculation query',
        description: 'Can we get confirmation on how the ₹25k semester fee deductions are settled at the end of the term?',
        mealType: 'general',
        mealDate: new Date(),
        urgency: 'low',
        status: 'pending'
      }
    ]);
    console.log('📝 Seeded sample complaints');

    // Seed Sample Feedbacks / Ratings
    await Feedback.create([
      {
        student: student1._id,
        studentName: student1.name,
        mealType: 'lunch',
        rating: 5,
        dishName: 'Paneer Butter Masala',
        comment: 'Delicious gravy and soft fresh paneer. One of the best lunches this week!'
      },
      {
        student: student2._id,
        studentName: student2.name,
        mealType: 'dinner',
        rating: 5,
        dishName: 'Hyderabadi Dum Biryani',
        comment: 'Amazing aroma and flavorful rice. Loved the raita combo!'
      },
      {
        student: student1._id,
        studentName: student1.name,
        mealType: 'breakfast',
        rating: 4,
        dishName: 'Aloo Paratha',
        comment: 'Crispy and served piping hot with curd.'
      },
      {
        student: student2._id,
        studentName: student2.name,
        mealType: 'dinner',
        rating: 2,
        dishName: 'Mix Veg Curry',
        comment: 'Vegetables were slightly undercooked.'
      },
      {
        student: student1._id,
        studentName: student1.name,
        mealType: 'snacks',
        rating: 4,
        dishName: 'Samosa & Chai',
        comment: 'Perfect evening snack crispiness!'
      }
    ]);
    console.log('⭐ Seeded sample ratings');

    // Seed Sample Opt-Outs (for ₹25k Fee deduction & Attendance)
    const today = new Date();
    await OptOut.create([
      {
        student: student1._id,
        date: today,
        mealType: 'breakfast',
        reason: 'Attending early morning college seminar',
        refundAmount: 40
      },
      {
        student: student1._id,
        date: today,
        mealType: 'lunch',
        reason: 'Coding hackathon lunch provided',
        refundAmount: 70
      },
      {
        student: student2._id,
        date: today,
        mealType: 'dinner',
        reason: 'Out with family',
        refundAmount: 70
      }
    ]);
    console.log('💰 Seeded sample opt-outs for fee deduction ledger');

    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
