const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { assignmentStats, overview } = require('../controllers/analytics');

router.get('/overview', verifyToken, requireRole('admin'), overview);
router.get('/assignment/:id', verifyToken, requireRole('admin'), assignmentStats);

module.exports = router;
