import {body} from "express-validator";

export const validatePostUpdateRequest = [
    body('title').optional().isString().isLength({min: 3}).withMessage('Title must be at least 3 characters'),
    body('content').optional().isString().isLength({min: 10}).withMessage('Content must be at least 10 characters'),
    body('authorId').notEmpty().isString().withMessage('The post must be belong to an author'),
];