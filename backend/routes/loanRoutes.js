const express = require("express");
const router = express.Router();
const { requireAdminPhone } = require("../middleware/adminAccess");
const {
    createLoan,
    getAdminLoanDocumentUrl,
    getLoansByUser,
    getAllLoans,
    reserveApplicationNumber,
    requestDocumentUpload,
    updateLoanStatus,
} = require("../controllers/loanController");

router.post("/application-number", reserveApplicationNumber);
router.post("/document-upload-url", requestDocumentUpload);
router.post("/createLoan", createLoan);
router.get("/", getLoansByUser);
router.get("/user/:userId", getLoansByUser);
router.get("/admin/all", requireAdminPhone, getAllLoans);
router.get("/admin/:id/document/:documentKey", requireAdminPhone, getAdminLoanDocumentUrl);
router.put("/admin/:id/status", requireAdminPhone, updateLoanStatus);

module.exports = router;
