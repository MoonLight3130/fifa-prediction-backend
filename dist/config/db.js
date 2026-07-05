import mongoose from 'mongoose';
/**
 * Connects to MongoDB Atlas using the MONGODB_URI environment variable.
 */
export async function connectDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
}
