import Author from "../../models/author.js";
import Post from "../../models/post.js";
import { NotFoundError } from "../../exceptions/systemErrorExceptions.js";

export const deleteAuthorAndAssociatedPosts = async (params) => {
    const author = await Author.findById(params._id);
    if (!author) {
        throw new NotFoundError('Author not found');
    }
    await Post.deleteMany({ author: params._id });
    await Author.findByIdAndDelete(params._id);
    return { success: true };
};