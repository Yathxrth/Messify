import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/messify';
    
    if (uri.includes('<db_password>')) {
      console.warn('⚠️ Warning: MONGO_URI contains placeholder <db_password>. Please update your database password in backend/.env.');
      console.log('🔄 Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/messify)...');
      uri = 'mongodb://127.0.0.1:27017/messify';
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ Primary MongoDB Connection Error: ${error.message}`);
    // Try fallback to local MongoDB if cloud fails
    try {
      console.log('🔄 Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/messify)...');
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/messify', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`✅ Connected to Local MongoDB: ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ Local MongoDB Fallback also failed: ${localErr.message}`);
      console.error('💡 To connect to MongoDB Atlas Cloud, please replace <db_password> in backend/.env with your actual password.');
    }
  }
};

export default connectDB;
