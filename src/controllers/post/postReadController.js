import {getAllPosts, getPostById} from "../../services/postServices/postReadService.js";


export const getPosts = async (req, res) => {
    try {
        const posts = await getAllPosts();
        res.json(posts);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await getPostById(req.params.postId);
        res.json(post);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};