import {jest, describe, afterEach, afterAll, beforeAll, it, expect} from '@jest/globals';

let getAllAuthors;
let getAuthorById;
let NotFoundError;
let mockFind;
let mockFindById;

beforeAll(async () => {
    mockFind = jest.fn();
    mockFindById = jest.fn();

    jest.unstable_mockModule('../../../models/author.js', () => ({
        default: {
            find: mockFind,
            findById: mockFindById
        }
    }));

    NotFoundError = class extends Error {
        constructor(message) {
            super(message);
            this.statusCode = 404;
            this.name = "NotFoundError";
        }
    };

    jest.unstable_mockModule('../../../exceptions/systemErrorExceptions.js', () => ({
        NotFoundError
    }));

    const authorService = await import('../../../services/authorServices/authorReadService.js');
    getAllAuthors = authorService.getAllAuthors;
    getAuthorById = authorService.getAuthorById;
});

describe("authorReadService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe("getAllAuthors", () => {
        it('should return all authors', async () => {
            const mockAuthors = [{name: "John", email: "john@example.com"}];
            mockFind.mockResolvedValue(mockAuthors);

            const result = await getAllAuthors();

            expect(mockFind).toHaveBeenCalled();
            expect(result).toEqual(mockAuthors);
        });

        it('should throw error if database operation fails', async () => {
            const dbError = new Error('Database error');
            mockFind.mockRejectedValue(dbError);

            await expect(getAllAuthors()).rejects.toThrow('Database error');
        });

        it('should return empty array if no authors found', async () => {
            mockFind.mockResolvedValue([]);

            const result = await getAllAuthors();

            expect(mockFind).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('getAuthorById', () => {
        it('should return author by id', async () => {
            const validObjectId = "507f1f77bcf86cd799439011";
            const mockAuthor = {id: validObjectId, name: 'Test Author'};
            mockFindById.mockResolvedValue(mockAuthor);

            const result = await getAuthorById(validObjectId);

            expect(mockFindById).toHaveBeenCalledWith(validObjectId);
            expect(result).toEqual(mockAuthor);
        });

        it('should throw NotFoundError if author not found', async () => {
            const validObjectId = "507f1f77bcf86cd799439012";
            mockFindById.mockResolvedValue(null);

            await expect(getAuthorById(validObjectId))
                .rejects
                .toThrow(NotFoundError);

            expect(mockFindById).toHaveBeenCalledWith(validObjectId);
        });

        it('should propagate error with status code if database operation fails', async () => {
            const validObjectId = "507f1f77bcf86cd799439013";
            const dbError = new Error('Database error');
            mockFindById.mockRejectedValue(dbError);

            await expect(getAuthorById(validObjectId)).rejects.toThrow('Database error');
        });

        it('should set status code to 500 for non-status errors', async () => {
            const validObjectId = "507f1f77bcf86cd799439014";
            const dbError = new Error('Database error');
            mockFindById.mockRejectedValue(dbError);

            try {
                await getAuthorById(validObjectId);
                fail('Expected error was not thrown');
            } catch (error) {
                expect(error.statusCode).toBe(500);
            }
        });
    });
});