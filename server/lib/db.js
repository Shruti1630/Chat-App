import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Chat-App';
        console.log('🔗 Connecting to MongoDB with URI:', uri);
        
        await mongoose.connect(uri);
        
        console.log('✅ MongoDB Connected to database');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('⚠️  Continuing without database connection');
    }
};