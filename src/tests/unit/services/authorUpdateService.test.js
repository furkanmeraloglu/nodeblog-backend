import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

// Set up mocks and service reference
let updateAuthorById;
let mockFindById;
let mockFindByIdAndUpdate;
let mockSelect;

beforeAll(async () => {
  // Mock the Author model
  mockSelect = jest.fn();
  mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
    select: mockSelect
  }));
  mockFindById = jest.fn();

  jest.unstable_mockModule('../../../models/author', () => ({
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate
    }
  }));

  // Mock bcrypt
  jest.unstable_mockModule('bcrypt', () => ({
    default: {
      hash: jest.fn().mockImplementation((password, saltRounds) =>
        Promise.resolve(`hashed_${password}`)
      )
    }
  }));

  // Mock system error exceptions
  jest.unstable_mockModule('../../../exceptions/systemErrorExceptions', () => ({
    NotFoundError: class NotFoundError extends Error {
      constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
      }
    }
  }));

  // Import the service after mocking dependencies
  const authorUpdateService = await import('../../../services/authorServices/authorUpdateService');
  updateAuthorById = authorUpdateService.updateAuthorById;
});

describe('authorUpdateService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAuthorById', () => {
    it('should update an author with provided data', async () => {
      // Arrange
      const authorId = 'author123';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockAuthor = { _id: authorId, name: 'Original Name' };
      const updatedAuthor = { _id: authorId, ...updateData };

      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue(updatedAuthor);

      // Act
      const result = await updateAuthorById(authorId, updateData);

      // Assert
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
      // Arrange
      const authorId = 'author456';
      const updateData = {
        name: 'New Name',
        password: 'newPassword123'
      };

      const mockAuthor = { _id: authorId };
      mockFindById.mockResolvedValue(mockAuthor);
      mockSelect.mockResolvedValue({ _id: authorId, name: 'New Name' });

      const bcryptMock = await import('bcrypt');

      // Act
      await updateAuthorById(authorId, updateData);

      // Assert
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
      // Arrange
      const authorId = 'nonExistentAuthor';
      const updateData = { name: 'New Name' };

      mockFindById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateAuthorById(authorId, updateData)).rejects.toThrow('Author not found');
      expect(mockFindById).toHaveBeenCalledWith(authorId);
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});