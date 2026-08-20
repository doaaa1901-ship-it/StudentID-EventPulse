const Message = require('../models/message.model');
const Event = require('../models/event.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create announcement & broadcast to socket room
// @route   POST /api/announcements
// @access  Private (Admin only)
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId, text } = req.body;

  if (!eventId || !text) {
    return next(new AppError('Please provide eventId and text for the announcement', 400));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Persist announcement
  const message = await Message.create({
    event: eventId,
    sender: req.user.userId || req.user.id,
    text
  });

  const populatedMessage = await message.populate('sender', 'name email');

  // Emit real-time broadcast to event room
  const io = req.app.get('io');
  if (io) {
    io.to(eventId).emit('announcement', populatedMessage);
  }

  res.status(201).json({
    status: 'success',
    data: populatedMessage
  });
});

// @desc    Fetch announcement history for an event
// @route   GET /api/announcements/:eventId
// @access  Public
exports.getAnnouncementsByEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const messages = await Message.find({ event: eventId })
    .populate('sender', 'name email')
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages
  });
});