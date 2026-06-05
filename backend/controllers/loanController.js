const Loan = require("../models/Loan");
const { DOCUMENT_RULES, createPresignedDownload, createPresignedUpload } = require("../services/r2Storage");
const { sendNotificationToUser } = require("../services/pushNotifications");

const requiredDocumentKeys = Object.keys(DOCUMENT_RULES);
const APPLICATION_PREFIX = "LS";

const generateApplicationNumber = () => {
    const now = new Date();
    const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("");
    const randomPart = Math.floor(100000 + Math.random() * 900000);

    return `${APPLICATION_PREFIX}-${datePart}-${randomPart}`;
};

const reserveUniqueApplicationNumber = async () => {
    for (let attempts = 0; attempts < 5; attempts += 1) {
        const applicationNumber = generateApplicationNumber();
        const existingLoan = await Loan.exists({ applicationNumber });

        if (!existingLoan) {
            return applicationNumber;
        }
    }

    throw new Error("Unable to generate application number");
};

const validateUploadedDocuments = (documents = {}) => {
    if (!documents || typeof documents !== "object") {
        return "Missing required field: documents";
    }

    const missingDocuments = requiredDocumentKeys.filter((key) => !documents[key]?.key);

    if (missingDocuments.length > 0) {
        return `Missing uploaded documents: ${missingDocuments.join(", ")}`;
    }

    return "";
};

exports.reserveApplicationNumber = async (_req, res) => {
    try {
        const applicationNumber = await reserveUniqueApplicationNumber();
        return res.json({ applicationNumber });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.requestDocumentUpload = async (req, res) => {
    try {
        const uploadData = await createPresignedUpload({
            userId: req.body.userId,
            applicationNumber: req.body.applicationNumber,
            documentType: req.body.documentType,
            fileName: req.body.fileName,
            mimeType: req.body.mimeType,
            size: req.body.size,
        });

        return res.json(uploadData);
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

exports.createLoan = async (req, res) => {
    try {
        const requiredFields = [
            "userId",
            "applicationNumber",
            "name",
            "phone",
            "email",
            "address",
            "pincode",
            "tenth",
            "twelfth",
            "college",
            "course",
            "income",
            "loanAmount",
            "duration",
        ];

        const missingFields = requiredFields.filter((field) => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        const documentError = validateUploadedDocuments(req.body.documents);

        if (documentError) {
            return res.status(400).json({ error: documentError });
        }

        const loan = new Loan({
            userId: req.body.userId,
            applicationNumber: req.body.applicationNumber,
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            pincode: req.body.pincode,
            tenth: req.body.tenth,
            twelfth: req.body.twelfth,
            college: req.body.college,
            course: req.body.course,
            income: req.body.income,
            loanAmount: req.body.loanAmount,
            duration: req.body.duration,
            documents: req.body.documents,
            status: "In Review",
        });

        await loan.save();

        res.json({ message: "Loan submitted", loan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLoansByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "Missing required field: userId" });
        }

        const loans = await Loan.find({ userId }).sort({ createdAt: -1 });

        res.json({ loans });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllLoans = async (_req, res) => {
    try {
        const loans = await Loan.find({}).sort({ createdAt: -1 });
        return res.json({ loans });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getAdminLoanDocumentUrl = async (req, res) => {
    try {
        const { id, documentKey } = req.params;
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        const document = loan.documents?.[documentKey];

        if (!document?.key) {
            return res.status(404).json({ error: "Document not found" });
        }

        const signedUrl = await createPresignedDownload({
            key: document.key,
            originalName: document.originalName || document.name,
            mimeType: document.mimeType,
        });

        return res.json({
            ...signedUrl,
            document: {
                documentType: documentKey,
                originalName: document.originalName || document.name,
                mimeType: document.mimeType,
                size: document.size,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.updateLoanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ["In Review", "Approved", "Rejected", "Disbursed"];

        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const loan = await Loan.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        try {
            await sendNotificationToUser({
                userId: loan.userId,
                title: "Loan application update",
                body: `Your application ${loan.applicationNumber || ""} is now ${status}.`.trim(),
                data: {
                    type: "loan-status-update",
                    loanId: String(loan._id),
                    applicationNumber: loan.applicationNumber,
                    status,
                },
            });
        } catch (notificationErr) {
            console.log("PUSH NOTIFICATION ERROR:", notificationErr.message);
        }

        return res.json({ loan });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
