import mongoose from "mongoose";
import postSchema from "../schema/post";

export const PostModel = mongoose.model("Post", postSchema,'post');