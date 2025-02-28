import {body} from "express-validator";

export const validatePostCreateReuqest = [
    body('name')
        .optional()
        .isLength({min: 2})
        .withMessage('Name must be at least 2 characters'),

    body('username')
        .optional()
        .isLength({min: 3})
        .withMessage('Username must be at least 3 characters'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .optional()
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters'),

    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
];