import {deleteAuthorAndAssociatedPosts} from "../../services/authorServices/authorDeleteService.js";


export const deleteAuthor = async (req, res) => {
    try {
        const authorId = req.params.authorId;
        await deleteAuthorAndAssociatedPosts(authorId);
        res.status(200).json({
            message: 'AuthorModel has been deleted successfully'
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};