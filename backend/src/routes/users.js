const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getMe, getAllStudents } = require('../controllers/users');

router.get('/me', verifyToken, getMe);
router.get('/students', verifyToken, getAllStudents);

module.exports = router;
