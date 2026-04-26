const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    userId: String,

    name: String,
    phone: String,
    email: String,
    address: String,
    pincode: String,

    tenth: String,
    twelfth: String,
    college: String,
    course: String,

    income: String,
    loanAmount: String,
    duration: String,
}, { timestamps: true });

module.exports = mongoose.model("Loan", loanSchema);
