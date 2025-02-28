import {validationResult} from "express-validator";
import {createNewPost} from "../../services/postServices/postCreateService.js";

export const createPost = async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({
            errors: validationErrors.array(),
        });
    }
    try {
        const post = await createNewPost(req.body);
        res.status(201).json(post);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};