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
    }
}, {
    collection: 'post',
  versionKey: false,
});

export default postSchema;