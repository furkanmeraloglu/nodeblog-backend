import Author from "../../models/author.js";
import Post from "../../models/post.js";
import { NotFoundError } from "../../exceptions/systemErrorExceptions.js";

export const deleteAuthorAndAssociatedPosts = async (params) => {
    const author = await Author.findById(params.authorId);
    if (!author) {
        throw new NotFoundError('Author not found');
    }
    await Post.deleteMany({ authorId: params.authorId });
    await Author.findByIdAndDelete(params.authorId);
    return { success: true };
};