import Author from '../../models/author.js';
import bcrypt from 'bcrypt';
import {NotFoundError} from '../../exceptions/systemErrorExceptions.js';

export const updateAuthorById = async (authorId, updateData) => {
    // Find author first to check existence
    const author = await Author.findById(authorId);
    if (!author) {
        throw new NotFoundError('Author not found');
    }

    // Hash password if it's provided
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Set update timestamp
    updateData.updatedAt = new Date();

    // Update author and return updated document
    return Author.findByIdAndUpdate(
        authorId,
        {$set: updateData},
        {new: true, runValidators: true}
    ).select('-password');
};