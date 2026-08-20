const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/announcements.controller');

router.get('/:eventId', ctrl.getAnnouncementsByEvent);
router.post('/', requireAuth, requireRole('admin'), ctrl.createAnnouncement);

module.exports = router;