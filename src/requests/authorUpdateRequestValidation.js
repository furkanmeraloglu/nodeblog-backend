import {body} from 'express-validator';

export const validateAuthorUpdateRequest = [
    body('name').optional().isString().isLength({min: 2}).withMessage('Name must be at least 2 characters'),
    body('username').optional().isString().isLength({min: 3}).withMessage('Username must be at least 3 characters'),
    body('email').optional().isString().isEmail().withMessage('Please provide a valid email address'),
    body('password').optional().isString().isLength({min: 6}).withMessage('Password must be at least 6 characters'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];