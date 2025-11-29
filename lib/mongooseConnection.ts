import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongoose() {
    if (isConnected) {
        return mongoose;
    }

    const uri = process.env.MONGODB_URL;
    if (!uri) {
        throw new Error('Missing MONGODB_URL environment variable');
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        console.log('Connected to MongoDB with Mongoose');
        return mongoose;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function disconnectMongoose() {
    if (isConnected) {
        await mongoose.disconnect();
        isConnected = false;
    }
}
