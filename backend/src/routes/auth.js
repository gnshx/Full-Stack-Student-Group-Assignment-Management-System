const router = require('express').Router();
const { register, login, registerValidation, loginValidation } = require('../controllers/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;
