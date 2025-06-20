import { PostModel } from "../models/post";
import { PostData } from "../types/post";
import { UpsertStatus } from "../types/vector";

interface UpdateDataI {
  vectorStatus: UpsertStatus | "dead";
  vectorError?: string;
  retryCount?: number;
}

export const fetchBlogPostContent = async (postId: string) => {
  try {
    const postData = await PostModel.findOne({
      slug: postId,
    });
    console.log("FETCHED POST : ", postData);
    return postData as PostData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBlogVectorStatus = async (
  postId: string,
  status: UpsertStatus | "dead",
  error: string | null,
  shouldIncrementRetryCount: boolean = false
) => {
  try {
    const updateData: UpdateDataI = {
      vectorStatus: status,
    };

    if (error) {
      updateData.vectorError = error;
    }

    const updateOps: any = {
      $set: updateData,
    };

    if (shouldIncrementRetryCount) {
      updateOps.$inc = { retryCount: 1 };
    } else {
      updateOps.$set.retryCount = 0;
    }

    const updatedPost = await PostModel.findOneAndUpdate(
      { slug: postId },
      updateOps,
      { new: true }
    );

    return updatedPost;
  } catch (error) {
    console.error("Error updating blog vector status:", error);
    return null;
  }
};

export const fetchPostsWithPendingVector = async () => {
  try {
    const pendingPosts = await PostModel.find({
      vectorStatus: {
        $in: ["pending", "failed", null],
      },
      retryCount: {
        $lte : 3
      }
    })
      .sort({
        retryCount: 1,
      })
      .limit(5).lean();
    console.log("PENDING POSTS : ",pendingPosts)
    return pendingPosts;
  } catch (error) {
    console.error("Error fetching posts with pending vector status:", error);
    return [];
  }
};
