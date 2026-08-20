const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const ctrl = require('../controllers/registrations.controller');
const validate = require('../middleware/validate');

const registerValidation = [
  body('event').isMongoId().withMessage('Event ID must be a valid MongoId'),
  validate
];

router.use(requireAuth);

router.post('/', registerValidation, ctrl.registerForEvent);
router.get('/my', ctrl.getMyRegistrations);
router.delete('/:id', ctrl.cancelRegistration);

module.exports = router;