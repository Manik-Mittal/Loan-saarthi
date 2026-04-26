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

// Get profile
exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
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
        const allowedFields = {
            name: req.body.name,
            dob: req.body.dob,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            pincode: req.body.pincode,
            pan: req.body.pan,
            gender: req.body.gender,
            marital: req.body.marital,
            education: {
                class10: req.body.education?.class10,
                class12: req.body.education?.class12,
                school: req.body.education?.school,
                college: req.body.education?.college,
                course: req.body.education?.course,
                year: req.body.education?.year,
                marks: req.body.education?.marks,
            },
            financial: {
                income: req.body.financial?.income,
                loanAmount: req.body.financial?.loanAmount,
                duration: req.body.financial?.duration,
                bank: req.body.financial?.bank,
            },
        };

        const user = await User.findByIdAndUpdate(
            id,
            allowedFields,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
