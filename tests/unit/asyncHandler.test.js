const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler Unit Tests', () => {
  it('should invoke the wrapped function with req, res, and next', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const wrapped = asyncHandler(fn);
    const req = {}, res = {}, next = jest.fn();

    await wrapped(req, res, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it('should catch errors and pass them to next', async () => {
    const error = new Error('Test error');
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);
    const req = {}, res = {}, next = jest.fn();

    await wrapped(req, res, next);
    
    // Allow Promise.resolve().catch to complete
    await new Promise(process.nextTick);
    expect(next).toHaveBeenCalledWith(error);
  });
});