import {NotFoundError} from "../../exceptions/systemErrorExceptions.js";
import PostModel from "../../models/postModel.js";

export const updatePostById = async (req) => {
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);
    if (!post) {
        throw new NotFoundError('Post not found');
    }

    try {
        const postUpdateData = setUpdateDataForPost(req);

        return PostModel.findByIdAndUpdate(
            postId,
            {$set: postUpdateData},
            {new: true, runValidators: true}
        );
    } catch (err) {
        throw new Error(err);
    }
};

const setUpdateDataForPost = (req) => {
    const { title, content, authorId } = req.body;
    let updateData = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (authorId) updateData.authorId = authorId;

    updateData.updatedAt = new Date();
    return updateData;
}