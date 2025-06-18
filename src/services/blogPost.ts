import { PostModel } from "../models/post"
import { PostData } from "../types/post";

export const fetchBlogPostContent = async (postId: string) => {
    try {
        
        const postData = await PostModel.findOne({
            slug : postId
        });
        console.log("FETCHED POST : ", postData);
        return postData as PostData;
    } catch (error) {
        console.error(error);
        return null;
    }
}