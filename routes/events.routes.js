const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/events.controller');
const validate = require('../middleware/validate');

const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isMongoId().withMessage('Category must be a valid MongoId'),
  body('date').isISO8601().withMessage('Date must be a valid ISO8601 date string'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  validate
];

const updateEventValidation = [
  param('id').isMongoId().withMessage('Invalid Event ID format'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isMongoId().withMessage('Category must be a valid MongoId'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date string'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  validate
];

router.get('/', ctrl.getEvents);
router.get('/:id', param('id').isMongoId().withMessage('Invalid Event ID format'), validate, ctrl.getEventById);

router.post('/', requireAuth, requireRole('admin'), createEventValidation, ctrl.createEvent);
router.patch('/:id', requireAuth, requireRole('admin'), updateEventValidation, ctrl.updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), param('id').isMongoId().withMessage('Invalid Event ID format'), validate, ctrl.deleteEvent);

module.exports = router;