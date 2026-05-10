const mongoose = require("mongoose");

const callbackRequestSchema = new mongoose.Schema(
    {
        userId: String,
        name: String,
        phone: {
            type: String,
            required: true,
        },
        email: String,
        preferredTime: String,
        message: String,
        source: {
            type: String,
            default: "mobile-app",
        },
        status: {
            type: String,
            enum: ["Pending", "Contacted", "Resolved"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CallbackRequest", callbackRequestSchema);
