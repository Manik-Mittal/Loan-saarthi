const Loan = require("../models/Loan");

exports.createLoan = async (req, res) => {
    try {
        const loan = new Loan(req.body);
        await loan.save();

        res.json({ message: "Loan submitted", loan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};