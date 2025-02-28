import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let updateAuthorById;
let mockFindById;
let mockFindByIdAndUpdate;
let mockSelect;

beforeAll(async () => {
  mockSelect = jest.fn();
  mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
    select: mockSelect
  }));
  mockFindById = jest.fn();

  jest.unstable_mockModule('../../../models/authorModel.js', () => ({
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate
    }
  }));

  jest.unstable_mockModule('bcrypt', () => ({
    default: {
      hash: jest.fn().mockImplementation((password, saltRounds) =>
        Promise.resolve(`hashed_${password}`)
      )
    }
  }));

  jest.unstable_mockModule('../../../exceptions/systemErrorExceptions', () => ({
    NotFoundError: class NotFoundError extends Error {
      constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
      }
    }
  }));

  const authorUpdateService = await import('../../../services/authorServices/authorUpdateService.js');
  updateAuthorById = authorUpdateService.updateAuthorById;
});

describe('authorUpdateService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAuthorById', () => {
    it('should update an author with provided data', async () => {
      const authorId = 'author123';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockAuthor = { _id: authorId, name: 'Original Name' };
      const updatedAuthor = { _id: authorId, ...updateData };

      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue(updatedAuthor);

      const result = await updateAuthorById(authorId, updateData);

      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        authorId,
        { $set: expect.objectContaining({
          name: updateData.name,
          email: updateData.email,
          updatedAt: expect.any(Date)
        })},
        {new: true, runValidators: true}
      );
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(updatedAuthor);
    });

    it('should hash password if it is included in update data', async () => {
      const authorId = 'author456';
      const updateData = {
        name: 'New Name',
        password: 'newPassword123'
      };

      const mockAuthor = { _id: authorId };
      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue({ _id: authorId, name: 'New Name' });

      const bcryptMock = await import('bcrypt');

      await updateAuthorById(authorId, updateData);

      expect(bcryptMock.default.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        authorId,
        { $set: expect.objectContaining({
          name: 'New Name',
          password: 'hashed_newPassword123',
          updatedAt: expect.any(Date)
        })},
        {new: true, runValidators: true}
      );
    });

    it('should throw NotFoundError if author does not exist', async () => {
      const authorId = 'nonExistentAuthor';
      const updateData = { name: 'New Name' };

      mockFindById.mockResolvedValue(null);

      await expect(updateAuthorById(authorId, updateData)).rejects.toThrow('AuthorModel not found');
      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});