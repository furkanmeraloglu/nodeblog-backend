import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {validatePostCreateRequest} from "../requests/postCreateRequestValidation.js";
import {validatePostUpdateRequest} from "../requests/postUpdateRequestValidation.js";

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:postId', getPostById);
router.post('/', authMiddleware, validatePostCreateRequest, createPost);
router.patch('/:postId', authMiddleware, validatePostUpdateRequest, updatePost);
router.delete('/:postId', authMiddleware, deletePost);

export default router;