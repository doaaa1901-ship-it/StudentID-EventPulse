const AppError = require('../../utils/AppError');

describe('AppError Unit Tests', () => {
  it('should create an error with status "fail" for 404 status code', () => {
    const error = new AppError('Not found', 404);
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('should create an error with status "error" for 500 status code', () => {
    const error = new AppError('Server error', 500);
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(true);
  });
});