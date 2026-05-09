const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    dob: String,
    email: String,
    address: mongoose.Schema.Types.Mixed,
    pincode: String,
    pan: String,
    gender: String,
    marital: String,

    education: {
        class10: Number,
        class12: Number,
        school: String,
        college: String,
        course: String,
        year: String,
        marks: String
    },

    financial: {
        income: Number,
        loanAmount: String,
        duration: String,
        bank: String
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
