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
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        country: String
    },
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
    },

    documents: mongoose.Schema.Types.Mixed,
    expoPushTokens: [{
        token: {
            type: String,
            required: true,
        },
        platform: String,
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
