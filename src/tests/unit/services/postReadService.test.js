import {jest, describe, afterEach, afterAll, beforeAll, it, expect} from '@jest/globals';

let getAllPosts;
let getPostById;
let NotFoundError;
let mockFind;
let mockFindById;

beforeAll(async () => {
    mockFind = jest.fn();
    mockFindById = jest.fn();

    jest.unstable_mockModule('../../../models/postModel.js', () => ({
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

    const postReadService = await import('../../../services/postServices/postReadService.js');
    getAllPosts = postReadService.getAllPosts;
    getPostById = postReadService.getPostById;
});

describe("postReadService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe("getAllPosts", () => {
        it('should return all posts', async () => {
            const mockPosts = [{
                title: "Test Blog Title",
                content: "Test blog content of this title"
            }];
            mockFind.mockResolvedValue(mockPosts);

            const result = await getAllPosts();

            expect(mockFind).toHaveBeenCalled();
            expect(result).toEqual(mockPosts);
        });
        it('should throw error if database operation fails', async () => {
            const dbError = new Error('Database error');
            mockFind.mockRejectedValue(dbError);

            await expect(getAllPosts()).rejects.toThrow('Database error');
        });
        it('should return empty array if no authors found', async () => {
            mockFind.mockResolvedValue([]);

            const result = await getAllPosts();

            expect(mockFind).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('getPostById', () => {
        it('should return post by id', async () => {
            const validObjectId = "507f1f77bcf86cd799439011";
            const mockPost = {
                id: validObjectId,
                title: 'Test Blog Title'
            };
            mockFindById.mockResolvedValue(mockPost);

            const result = await getPostById(validObjectId);

            expect(mockFindById).toHaveBeenCalledWith(validObjectId);
            expect(result).toEqual(mockPost);
        });
        it('should throw NotFoundError if post not found', async () => {
            const validObjectId = "507f1f77bcf86cd799439012";
            mockFindById.mockResolvedValue(null);

            await expect(getPostById(validObjectId))
                .rejects
                .toThrow(NotFoundError);

            expect(mockFindById).toHaveBeenCalledWith(validObjectId);
        });
        it('should propagate error with status code if database operation fails', async () => {
            const validObjectId = "507f1f77bcf86cd799439013";
            const dbError = new Error('Database error');
            mockFindById.mockRejectedValue(dbError);

            await expect(getPostById(validObjectId)).rejects.toThrow('Database error');
        });
        it('should set status code to 500 for non-status errors', async () => {
            const validObjectId = "507f1f77bcf86cd799439014";
            const dbError = new Error('Database error');
            mockFindById.mockRejectedValue(dbError);

            try {
                await getPostById(validObjectId);
                fail('Expected error was not thrown');
            } catch (error) {
                expect(error.statusCode).toBe(500);
            }
        });
    });
});