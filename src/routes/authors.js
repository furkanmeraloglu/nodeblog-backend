import express from "express";
import {validateAuthorRegisterRequest} from "../requests/authorRegisterRequestValidation.js";
import {validateAuthorLoginRequest} from "../requests/authorLoginRequestValidation.js";
import {validateAuthorUpdateRequest} from "../requests/authorUpdateRequestValidation.js";
import { register, login, logout } from "../controllers/author/authorAuthController.js";
import { getAuthors, getAuthor } from "../controllers/author/authorReadController.js";
import { updateAuthor } from "../controllers/author/authorUpdateController.js";
import { deleteAuthor } from "../controllers/author/authorDeleteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/', getAuthors);
router.get('/:authorId', getAuthor);
router.post('/register', validateAuthorRegisterRequest, register);
router.post('/login', validateAuthorLoginRequest, login);
router.post('/logout', authMiddleware, logout);
router.patch('/:authorId', authMiddleware, validateAuthorUpdateRequest, updateAuthor);
router.delete('/:authorId', authMiddleware, deleteAuthor);

export default router;