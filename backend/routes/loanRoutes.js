const express = require("express");
const router = express.Router();
const { requireAdminPhone } = require("../middleware/adminAccess");
const { createLoan, getLoansByUser, getAllLoans, updateLoanStatus } = require("../controllers/loanController");

router.post("/createLoan", createLoan);
router.get("/", getLoansByUser);
router.get("/user/:userId", getLoansByUser);
router.get("/admin/all", requireAdminPhone, getAllLoans);
router.put("/admin/:id/status", requireAdminPhone, updateLoanStatus);

module.exports = router;
