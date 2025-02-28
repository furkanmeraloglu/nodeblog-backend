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

      const mockReq = {
        params: { authorId },
        body: updateData
      };

      const mockAuthor = { _id: authorId, name: 'Original Name' };
      const updatedAuthor = { _id: authorId, ...updateData };

      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue(updatedAuthor);

      const result = await updateAuthorById(mockReq);

      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
          authorId,
          expect.objectContaining({
            $set: expect.any(Object)
          }),
          {new: true, runValidators: true}
      );

      const setUpdateDataCall = mockFindByIdAndUpdate.mock.calls[0][1];
      expect(setUpdateDataCall.$set).toBeTruthy();

      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(updatedAuthor);
    });

    it('should hash password if it is included in update data', async () => {
      const authorId = 'author456';
      const updateData = {
        name: 'New Name',
        password: 'newPassword123'
      };

      const mockReq = {
        params: { authorId },
        body: updateData
      };

      const mockAuthor = { _id: authorId };
      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue({ _id: authorId, name: 'New Name' });

      const bcryptMock = await import('bcrypt');

      await updateAuthorById(mockReq);

      expect(bcryptMock.default.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
          authorId,
          expect.objectContaining({
            $set: expect.any(Object)
          }),
          {new: true, runValidators: true}
      );

      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundError if author does not exist', async () => {
      const authorId = 'nonExistentAuthor';

      const mockReq = {
        params: { authorId },
        body: { name: 'New Name' }
      };

      mockFindById.mockResolvedValue(null);

      await expect(updateAuthorById(mockReq)).rejects.toThrow('Author not found');
      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});