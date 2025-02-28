import {NotFoundError} from "../../exceptions/systemErrorExceptions.js";
import PostModel from "../../models/postModel.js";

export const getAllPosts = async () => {
    try {
        const authors = await PostModel.find();
        if (!authors) {
            return [];
        }
        return authors;
    } catch (err) {
        throw new Error(err.message);
    }
};

export const getPostById = async (authorId) => {
    try {
        const post = await PostModel.findById(authorId);
        if (!post) {
            throw new NotFoundError("Post not found");
        }
        return post;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err;
    }
};

