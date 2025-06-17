import { PostModel } from "../models/post"

export const fetchBlogPostContent = async (postId: string) => {
    try {
        
        const postData = await PostModel.findOne({
            slug : postId
        });
        console.log("FETCHED POST : ", postData);
        return postData;
    } catch (error) {
        console.error(error);
        return null;
    }
}
