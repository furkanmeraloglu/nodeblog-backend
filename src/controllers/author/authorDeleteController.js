import {deleteAuthorAndAssociatedPosts} from "../../services/authorServices/authorDeleteService.js";


export const deleteAuthor = async (req, res) => {
    try {
        await deleteAuthorAndAssociatedPosts(req.body);
        res.status(200).json({
            message: 'Author has been deleted successfully'
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};