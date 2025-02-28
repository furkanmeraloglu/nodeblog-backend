import { validationResult } from 'express-validator';
import { updateAuthorById } from '../../services/authorServices/authorUpdateService.js';

export const updateAuthor = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    // Check if author is updating their own profile (implement auth middleware)
    const authorId = req.params.authorId;

    // Extract update fields
    const { name, username, email, password, avatar } = req.body;
    const updateData = {};

    // Only include fields that are provided
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (avatar) updateData.avatar = avatar;

    // Update author through service
    const updatedAuthor = await updateAuthorById(authorId, updateData);

    res.status(200).json({
      message: 'AuthorModel updated successfully',
      author: updatedAuthor
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message
    });
  }
};