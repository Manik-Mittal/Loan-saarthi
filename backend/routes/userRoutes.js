const express = require("express");
const router = express.Router();

const {
    loginUser,
    updateProfile
} = require("../controllers/userController");

router.post("/login", loginUser);
router.put("/update/:id", updateProfile);

module.exports = router;