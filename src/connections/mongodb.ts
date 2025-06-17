import mongoose from "mongoose";

const connectMongoDB = async () => {
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI must be defined in environment variables.");
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default connectMongoDB;