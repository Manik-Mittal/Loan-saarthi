const express = require("express");
const router = express.Router();
const { requireAdminPhone } = require("../middleware/adminAccess");
const {
    createCallbackRequest,
    getCallbackRequests,
    updateCallbackStatus,
} = require("../controllers/callbackController");

router.post("/", createCallbackRequest);
router.get("/", requireAdminPhone, getCallbackRequests);
router.put("/:id/status", requireAdminPhone, updateCallbackStatus);

module.exports = router;
