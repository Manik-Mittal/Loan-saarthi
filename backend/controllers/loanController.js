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
        });

        await loan.save();

        res.json({ message: "Loan submitted", loan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
