const express = require("express");
const router = express.Router();
const { requireAdminPhone } = require("../middleware/adminAccess");

const {
    sendLoginOtp,
    verifyLoginOtp,
    getProfile,
    updateProfile,
    registerPushToken,
    sendAdminNotification,
} = require("../controllers/userController");

router.post("/send-otp", sendLoginOtp);
router.post("/verify-otp", verifyLoginOtp);
router.get("/:id", getProfile);
router.post("/:id/push-token", registerPushToken);
router.post("/admin/:id/notify", requireAdminPhone, sendAdminNotification);
router.put("/update/:id", updateProfile);

module.exports = router;
