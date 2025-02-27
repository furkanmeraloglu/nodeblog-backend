import { getAllAuthors, getAuthorById } from "../services/authorServices/authorReadService.js";
import Author from "../models/author.js";

jest.mock("../models/author.js");

describe("authorReadService", () => {
   afterEach(() => {
       jest.clearAllMocks();
   });
   describe("getAllAuthors", () => {
       it('should return all authors', async () => {
           const mockAuthors = [{ name: "John", email: "john@example.com" }];
           Author.find.mockResolvedValue(mockAuthors);
           const result = await getAllAuthors();
           expect(Author.find).toHaveBeenCalled();
           expect(result).toEqual(mockAuthors);
       });
   });
    describe('getAuthorById', () => {
        it('should return author by id', async () => {
            const mockAuthor = { id: '123', name: 'Test Author' };
            Author.findById.mockResolvedValue(mockAuthor);
            const result = await getAuthorById('123');
            expect(Author.findById).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockAuthor);
        });
        it('should throw error if author not found', async () => {
            Author.findById.mockResolvedValue(null);
            await expect(getAuthorById('999')).rejects.toThrow('Author not found');
        });
    });
});