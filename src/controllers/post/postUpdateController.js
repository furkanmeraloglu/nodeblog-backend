import {validationResult} from "express-validator";
import {updatePostById} from "../../services/postServices/postUpdateService.js";

export const updatePost = async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({
            errors: validationErrors.array(),
        });
    }
    try {
        const updatedPost = await updatePostById(req);
        res.status(200).json({
            message: 'Post updated successfully.',
            post: updatedPost
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};