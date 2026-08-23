const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { confirmSubmission, getGroupSubmissions } = require('../controllers/submissions');

router.post('/:assignmentId/confirm', verifyToken, requireRole('student'), confirmSubmission);
router.get('/group/:groupId', verifyToken, getGroupSubmissions);

module.exports = router;
