import AuthorModel from '../../models/authorModel.js';
import bcrypt from 'bcrypt';
import {NotFoundError} from '../../exceptions/systemErrorExceptions.js';

export const updateAuthorById = async (authorId, updateData) => {
    // Find author first to check existence
    const author = await AuthorModel.findById(authorId);
    if (!author) {
        throw new NotFoundError('AuthorModel not found');
    }

    // Hash password if it's provided
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Set update timestamp
    updateData.updatedAt = new Date();

    // Update author and return updated document
    return AuthorModel.findByIdAndUpdate(
        authorId,
        {$set: updateData},
        {new: true, runValidators: true}
    ).select('-password');
};