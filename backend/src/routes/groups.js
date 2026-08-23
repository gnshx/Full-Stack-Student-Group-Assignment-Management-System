const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createGroup, addMember, getMyGroups, getAllGroups, getGroup, removeMember
} = require('../controllers/groups');

router.get('/mine', verifyToken, requireRole('student'), getMyGroups);
router.get('/', verifyToken, getAllGroups);
router.post('/', verifyToken, requireRole('student'), createGroup);
router.get('/:id', verifyToken, getGroup);
router.post('/:id/members', verifyToken, requireRole('student'), addMember);
router.delete('/:id/members/:studentId', verifyToken, requireRole('student'), removeMember);

module.exports = router;
