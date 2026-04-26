const User = require("../models/User");

// Create or login user (basic)
exports.loginUser = async (req, res) => {
    try {
        const { phone } = req.body;

        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({ phone });
        }
  


        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};