import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    vectorStatus: {
        type: String,
        enum: ['pending', 'upserted', 'failed'],
        default: 'pending'
    },
    retryCount: {
        type: Number,
        default: 0
    },
    vectorError: {
        type: String,
        default: null
    }
}, {
    collection: 'post',
  versionKey: false,
});

postSchema.index({ vectorStatus: 1, retryCount: 1 });

export default postSchema;