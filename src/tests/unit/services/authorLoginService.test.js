import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

let loginAuthor;
let mockFindOne;
let bcryptMock;
let jwtMock;

beforeAll(async () => {
    mockFindOne = jest.fn();

    jest.unstable_mockModule('../../../models/author', () => ({
        default: {
            findOne: mockFindOne
        }
    }));

    bcryptMock = {
        compare: jest.fn()
    };
    jest.unstable_mockModule('bcrypt', () => ({
        default: bcryptMock
    }));

    jwtMock = {
        sign: jest.fn().mockReturnValue('mocked_jwt_token')
    };
    jest.unstable_mockModule('jsonwebtoken', () => ({
        default: jwtMock
    }));

    jest.unstable_mockModule('dotenv', () => {
        const configFn = jest.fn();
        return {
            default: {
                config: configFn
            }
        };
    });

    jest.unstable_mockModule('../../../exceptions/systemErrorExceptions', () => ({
        NotFoundError: class NotFoundError extends Error {
            constructor(message) {
                super(message);
                this.name = 'NotFoundError';
                this.statusCode = 404;
            }
        },
        UnauthorizedError: class UnauthorizedError extends Error {
            constructor(message) {
                super(message);
                this.name = 'UnauthorizedError';
                this.statusCode = 401;
            }
        }
    }));

    process.env.JWT_SECRET = 'test_secret';

    const authorLoginService = await import('../../../services/authorServices/authorLoginService');
    loginAuthor = authorLoginService.loginAuthor;
});

describe('authorLoginService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loginAuthor', () => {
        it('should generate JWT token when login credentials are valid', async () => {
            const loginParams = {
                email: 'test@example.com',
                password: 'password123'
            };

            const mockAuthor = {
                _id: 'author123',
                email: loginParams.email,
                password: 'hashed_password'
            };

            mockFindOne.mockResolvedValue(mockAuthor);
            bcryptMock.compare.mockResolvedValue(true);

            const result = await loginAuthor(loginParams);

            expect(mockFindOne).toHaveBeenCalledWith({email: loginParams.email});
            expect(bcryptMock.compare).toHaveBeenCalledWith(loginParams.password, mockAuthor.password);
            expect(jwtMock.sign).toHaveBeenCalledWith(
                {id: mockAuthor._id},
                process.env.JWT_SECRET,
                {expiresIn: '1h'}
            );
            expect(result).toBe('mocked_jwt_token');
        });

        it('should throw NotFoundError if author with email is not found', async () => {
            const loginParams = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockFindOne.mockResolvedValue(null);

            await expect(loginAuthor(loginParams)).rejects.toThrow('Could not find an author with this email address');
            expect(mockFindOne).toHaveBeenCalledWith({email: loginParams.email});
            expect(bcryptMock.compare).not.toHaveBeenCalled();
            expect(jwtMock.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedError if password does not match', async () => {
            const loginParams = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const mockAuthor = {
                _id: 'author123',
                email: loginParams.email,
                password: 'hashed_password'
            };

            mockFindOne.mockResolvedValue(mockAuthor);
            bcryptMock.compare.mockResolvedValue(false);

            await expect(loginAuthor(loginParams)).rejects.toThrow('Wrong password!');
            expect(mockFindOne).toHaveBeenCalledWith({email: loginParams.email});
            expect(bcryptMock.compare).toHaveBeenCalledWith(loginParams.password, mockAuthor.password);
            expect(jwtMock.sign).not.toHaveBeenCalled();
        });

        it('should propagate unexpected errors with status code 500', async () => {
            const loginParams = {
                email: 'test@example.com',
                password: 'password123'
            };

            const unexpectedError = new Error('Database connection failed');
            mockFindOne.mockRejectedValue(unexpectedError);

            await expect(loginAuthor(loginParams)).rejects.toThrow('Database connection failed');
            const error = await loginAuthor(loginParams).catch(e => e);
            expect(error.statusCode).toBe(500);
        });
    });
});