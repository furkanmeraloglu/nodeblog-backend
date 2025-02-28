import {validationResult} from 'express-validator';
import {updateAuthorById} from '../../services/authorServices/authorUpdateService.js';

export const updateAuthor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const updatedAuthor = await updateAuthorById(req);
        res.status(200).json({
            message: 'Author updated successfully',
            author: updatedAuthor
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message
        });
    }
};