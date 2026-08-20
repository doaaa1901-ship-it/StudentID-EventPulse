const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register logged-in user for an event
// @route   POST /api/registrations
// @access  Private
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;
  const eventId = req.body.event;

  if (!eventId) {
    return next(new AppError('Please provide an event ID', 400));
  }

  // 1. Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // 2. Prevent double registration
  const existing = await Registration.findOne({
    event: eventId,
    attendee: userId
  });
  if (existing) {
    return next(new AppError('You are already registered for this event', 400));
  }

  // 3. Enforce capacity limit
  const currentCount = await Registration.countDocuments({ event: eventId });
  if (currentCount >= event.capacity) {
    return next(new AppError('This event is full', 400));
  }

  // 4. Create registration
  const registration = await Registration.create({
    event: eventId,
    attendee: userId
  });

  res.status(201).json({
    status: 'success',
    data: registration
  });
});

// @desc    Get registrations for current user
// @route   GET /api/registrations/my
// @access  Private
exports.getMyRegistrations = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;

  const registrations = await Registration.find({ attendee: userId })
    .populate({
      path: 'event',
      populate: { path: 'category' }
    });

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    data: registrations
  });
});

// @desc    Cancel a registration
// @route   DELETE /api/registrations/:id
// @access  Private
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;
  const registrationId = req.params.id;

  const registration = await Registration.findById(registrationId);
  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  // Ownership verification
  if (registration.attendee.toString() !== userId) {
    return next(new AppError('You can only cancel your own registration', 403));
  }

  await registration.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Registration cancelled successfully'
  });
});