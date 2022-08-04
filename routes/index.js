const router = require("express").Router();
const userController = require("../controllers");
const {check} = require('express-validator')
const auth = require('../middleware/auth')

// Login User
router.post("/api/auth/login", [
    check('email', 'Please Enter Valid email').isEmail(),
    check('password', 'A Valid Password is required').exists(),
],
userController.loginUser);

// Get logged in user
router.get('/api/auth/user', auth, userController.getLoggedInUser )

// Password Recovery
router.post('/api/auth/forgot', [
    check('email', 'Please Enter Valid email').isEmail(),
], userController.recoverPassword )

// Password Reset
router.post('/api/auth/reset/:id', [
    check('password', 'A Valid Password is required').exists(),
    check('password2', 'A Valid Confirm Password is required').exists(),
], userController.resetPassword )

// Get logged in staff
router.get('/api/auth/staff', auth, userController.getLoggedInStaff )

// Get logged in manager
router.get('/api/auth/manager', auth, userController.getLoggedInManager )

// Get logged in admin
router.get('/api/auth/admin', auth, userController.getLoggedInAdmin )

// Log out
router.get('/api/auth/logout', auth, userController.logOutUser )

// Register user
router.post("/api/auth/register", [
    check('email', 'Please Enter Valid email').isEmail(),
    check('password', 'A Valid Password is required').exists(),
    check('firstName', 'A Valid First Name is required').exists(),
    check('lastName', 'A Valid Last Name is required').exists(),
], userController.registerUser);

module.exports = router;
