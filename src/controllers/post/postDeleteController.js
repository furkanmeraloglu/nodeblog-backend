import {deletePostById} from "../../services/postServices/postDeleteService.js";

export const deletePost = async (req, res) => {
    try {
        await deletePostById(req.params.postId);
        res.status(200).json({
            message: 'Post has been deleted successfully'
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};