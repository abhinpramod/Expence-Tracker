const express = require("express");
const router = express.Router();
const { signupController, loginController, verifyOtpController, cheakauthController,logoutController } = require("../controller/auth.controller");
const protectRoute = require("../middleware/protectroute");

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/verify-otp', verifyOtpController);
router.get('/check-auth', protectRoute, cheakauthController);
router.post('/logout', protectRoute,logoutController);

module.exports = router;