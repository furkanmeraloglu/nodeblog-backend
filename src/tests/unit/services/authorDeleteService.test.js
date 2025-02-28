import { jest, describe, beforeAll, afterEach, it, expect } from '@jest/globals';

let deleteAuthorAndAssociatedPosts;
let mockFindById;
let mockDeleteMany;
let mockFindByIdAndDelete;

beforeAll(async () => {
  mockFindById = jest.fn();
  mockFindByIdAndDelete = jest.fn();

  jest.unstable_mockModule('../../../models/authorModel.js', () => ({
    default: {
      findById: mockFindById,
      findByIdAndDelete: mockFindByIdAndDelete
    }
  }));

  mockDeleteMany = jest.fn();

  jest.unstable_mockModule('../../../models/postModel.js', () => ({
    default: {
      deleteMany: mockDeleteMany
    }
  }));

  jest.unstable_mockModule('../../../exceptions/systemErrorExceptions.js', () => ({
    NotFoundError: class NotFoundError extends Error {
      constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
      }
    }
  }));

  const authorDeleteService = await import('../../../services/authorServices/authorDeleteService.js');
  deleteAuthorAndAssociatedPosts = authorDeleteService.deleteAuthorAndAssociatedPosts;
});

describe('authorDeleteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteAuthorAndAssociatedPosts', () => {
    it('should delete author and associated posts successfully', async () => {
      const authorId = '123456789';
      const params = { _id: authorId };
      const mockAuthor = { _id: authorId, name: 'Test Author' };

      mockFindById.mockResolvedValueOnce(mockAuthor);
      mockDeleteMany.mockResolvedValueOnce({ deletedCount: 2 });
      mockFindByIdAndDelete.mockResolvedValueOnce(mockAuthor);

      const result = await deleteAuthorAndAssociatedPosts(params);

      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockDeleteMany).toHaveBeenCalledWith({ author: authorId });
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(authorId);
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundError if author does not exist', async () => {
      const authorId = '123456789';
      const params = { _id: authorId };

      mockFindById.mockResolvedValueOnce(null);

      await expect(deleteAuthorAndAssociatedPosts(params))
        .rejects.toThrow('AuthorModel not found');

      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockDeleteMany).not.toHaveBeenCalled();
      expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      const authorId = '123456789';
      const params = { _id: authorId };
      const mockAuthor = { _id: authorId, name: 'Test Author' };
      const dbError = new Error('Database connection failed');

      mockFindById.mockResolvedValueOnce(mockAuthor);
      mockDeleteMany.mockRejectedValueOnce(dbError);

      await expect(deleteAuthorAndAssociatedPosts(params))
        .rejects.toThrow('Database connection failed');

      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockDeleteMany).toHaveBeenCalledWith({ author: authorId });
      expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});