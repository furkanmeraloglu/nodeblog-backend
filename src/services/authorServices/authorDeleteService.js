import AuthorModel from "../../models/authorModel.js";
import PostModel from "../../models/postModel.js";
import { NotFoundError } from "../../exceptions/systemErrorExceptions.js";

export const deleteAuthorAndAssociatedPosts = async (params) => {
    const author = await AuthorModel.findById(params.authorId);
    if (!author) {
        throw new NotFoundError('AuthorModel not found');
    }
    await PostModel.deleteMany({ authorId: params.authorId });
    await AuthorModel.findByIdAndDelete(params.authorId);
    return { success: true };
};