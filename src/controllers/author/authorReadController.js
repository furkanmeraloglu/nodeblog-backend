import {getAllAuthors, getAuthorById} from "../../services/authorServices/authorReadService.js";

export const getAuthors = async (req, res) => {
    try {
        const authors = await getAllAuthors();
        res.json(authors);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};

export const getAuthor = async (req, res) => {
    try {
        const author = await getAuthorById(req.params.authorId);
        res.json(author);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message,
        });
    }
};