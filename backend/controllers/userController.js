const User = require("../models/User");

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

const profileNeedsOnboarding = (user) => {
    const addressIsString = typeof user?.address === "string";

    return [
        user?.name,
        user?.dob,
        user?.gender,
        user?.address?.line1 || user?.address,
        addressIsString ? "provided" : user?.address?.city,
        addressIsString ? "provided" : user?.address?.state,
        user?.address?.pincode || user?.pincode,
    ].some((value) => !String(value || "").trim());
};

// Create or login user (basic)
exports.loginUser = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: "Enter a valid 10 digit mobile number" });
        }

        const existingUser = await User.findOne({ phone });
        const isNewUser = !existingUser;
        let user = existingUser;

        if (isNewUser) {
            user = await User.create({ phone });
        }

        res.json({
            ...user.toObject(),
            isNewUser,
            requiresOnboarding: profileNeedsOnboarding(user)
        });
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
