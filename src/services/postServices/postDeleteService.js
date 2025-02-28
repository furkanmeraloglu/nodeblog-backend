import {NotFoundError} from "../../exceptions/systemErrorExceptions.js";
import PostModel from "../../models/postModel.js";

export const deletePostById = async (postId) => {
    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            throw new NotFoundError('Post not found');
        }
        await PostModel.findByIdAndDelete(postId);
        return {success: true};
    } catch (err) {
        throw new Error(err);
    }
};