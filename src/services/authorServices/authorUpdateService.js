import AuthorModel from '../../models/authorModel.js';
import bcrypt from 'bcrypt';
import {NotFoundError} from '../../exceptions/systemErrorExceptions.js';

export const updateAuthorById = async (req) => {
    const authorId = req.params.authorId;
    const author = await AuthorModel.findById(authorId);
    if (!author) {
        throw new NotFoundError('Author not found');
    }

    try {
        const authorUpdateData = setUpdateDataForAuthor(req);

        return AuthorModel.findByIdAndUpdate(
            authorId,
            {$set: authorUpdateData},
            {new: true, runValidators: true}
        ).select('-password');
    } catch (err) {
        throw new Error(err);
    }
};

const setUpdateDataForAuthor = async (req) => {
    const {name, username, email, password, avatar} = req.body;
    let updateData = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (avatar) updateData.avatar = avatar;

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    updateData.updatedAt = new Date();

    return updateData;
}