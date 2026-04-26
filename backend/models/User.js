const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    email: String,
    address: String,
    pincode: String,

    education: {
        class10: Number,
        class12: Number,
        school: String,
        college: String,
        course: String,
        year: String
    },

    financial: {
        income: Number
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);