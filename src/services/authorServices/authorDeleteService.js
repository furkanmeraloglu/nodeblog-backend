import AuthorModel from "../../models/authorModel.js";
import PostModel from "../../models/postModel.js";
import { NotFoundError } from "../../exceptions/systemErrorExceptions.js";

export const deleteAuthorAndAssociatedPosts = async (authorId) => {
    const author = await AuthorModel.findById(authorId);
    if (!author) {
        throw new NotFoundError('Author not found');
    }
    await PostModel.deleteMany({ authorId: authorId });
    await AuthorModel.findByIdAndDelete(authorId);
    return { success: true };
};