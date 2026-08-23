const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createAssignment, updateAssignment, deleteAssignment, listAssignments, getAssignment
} = require('../controllers/assignments');

router.get('/', verifyToken, listAssignments);
router.get('/:id', verifyToken, getAssignment);
router.post('/', verifyToken, requireRole('admin'), createAssignment);
router.put('/:id', verifyToken, requireRole('admin'), updateAssignment);
router.delete('/:id', verifyToken, requireRole('admin'), deleteAssignment);

module.exports = router;
