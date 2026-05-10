const CallbackRequest = require("../models/CallbackRequest");

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

exports.createCallbackRequest = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: "Enter a valid 10 digit mobile number" });
        }

        const callback = await CallbackRequest.create({
            userId: req.body.userId,
            name: req.body.name,
            phone,
            email: req.body.email,
            preferredTime: req.body.preferredTime,
            message: req.body.message,
            source: req.body.source || "mobile-app",
        });

        return res.json({
            message: "Callback request submitted",
            callback,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getCallbackRequests = async (req, res) => {
    try {
        const status = req.query.status;
        const query = status ? { status } : {};
        const callbacks = await CallbackRequest.find(query).sort({ createdAt: -1 });

        return res.json({ callbacks });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.updateCallbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ["Pending", "Contacted", "Resolved"];

        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const callback = await CallbackRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!callback) {
            return res.status(404).json({ error: "Callback request not found" });
        }

        return res.json({ callback });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
