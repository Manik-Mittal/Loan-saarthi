const Loan = require("../models/Loan");

exports.createLoan = async (req, res) => {
    try {
        const requiredFields = [
            "userId",
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

        const loan = new Loan({
            userId: req.body.userId,
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

        return res.json({ loan });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
