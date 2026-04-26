const express = require("express");
const router = express.Router();
const { createLoan, getLoansByUser } = require("../controllers/loanController");

router.post("/createLoan", createLoan);
router.get("/", getLoansByUser);
router.get("/user/:userId", getLoansByUser);

module.exports = router;
