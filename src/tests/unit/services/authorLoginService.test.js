import {jest, describe, beforeAll, afterEach, it, expect} from '@jest/globals';

// Set up mocks and service reference
let loginAuthor;
let mockFindOne;
let bcryptMock;
let jwtMock;

beforeAll(async () => {
    // Mock the Author model
    mockFindOne = jest.fn();

    jest.unstable_mockModule('../../../models/author', () => ({
        default: {
            findOne: mockFindOne
        }
    }));

    // Mock bcrypt - fix to match import style
    bcryptMock = {
        compare: jest.fn()
    };
    jest.unstable_mockModule('bcrypt', () => ({
        default: bcryptMock
    }));

    // Mock jwt - fix to match import style
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

    // Mock system error exceptions
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

    // Set up JWT_SECRET environment variable
    process.env.JWT_SECRET = 'test_secret';

    // Import the service after mocking dependencies
    const authorLoginService = await import('../../../services/authorServices/authorLoginService');
    loginAuthor = authorLoginService.loginAuthor;
});

describe('authorLoginService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loginAuthor', () => {
        it('should generate JWT token when login credentials are valid', async () => {
            // Arrange
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

            // Act
            const result = await loginAuthor(loginParams);

            // Assert
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
            // Arrange
            const loginParams = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockFindOne.mockResolvedValue(null);

            // Act & Assert
            await expect(loginAuthor(loginParams)).rejects.toThrow('Could not find an author with this email address');
            expect(mockFindOne).toHaveBeenCalledWith({email: loginParams.email});
            expect(bcryptMock.compare).not.toHaveBeenCalled();
            expect(jwtMock.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedError if password does not match', async () => {
            // Arrange
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

            // Act & Assert
            await expect(loginAuthor(loginParams)).rejects.toThrow('Wrong password!');
            expect(mockFindOne).toHaveBeenCalledWith({email: loginParams.email});
            expect(bcryptMock.compare).toHaveBeenCalledWith(loginParams.password, mockAuthor.password);
            expect(jwtMock.sign).not.toHaveBeenCalled();
        });

        it('should propagate unexpected errors with status code 500', async () => {
            // Arrange
            const loginParams = {
                email: 'test@example.com',
                password: 'password123'
            };

            const unexpectedError = new Error('Database connection failed');
            mockFindOne.mockRejectedValue(unexpectedError);

            // Act & Assert
            await expect(loginAuthor(loginParams)).rejects.toThrow('Database connection failed');
            const error = await loginAuthor(loginParams).catch(e => e);
            expect(error.statusCode).toBe(500);
        });
    });
});