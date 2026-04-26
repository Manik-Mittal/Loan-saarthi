const express = require("express");
const router = express.Router();

const {
    loginUser,
    getProfile,
    updateProfile
} = require("../controllers/userController");

router.post("/login", loginUser);
router.get("/:id", getProfile);
router.put("/update/:id", updateProfile);

module.exports = router;
