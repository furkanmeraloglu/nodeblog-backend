import PostModel from "../../models/postModel.js";

export const createNewPost = async (params) => {
    const post = new PostModel({
        title: params.title,
        content: params.content,
        authorId: params.authorId,
    });
    try {
        return await post.save();
    } catch (err) {
        throw new Error(err.message);
    }
};