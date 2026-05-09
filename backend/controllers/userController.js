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

const removeUndefined = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .map(([entryKey, entryValue]) => [entryKey, removeUndefined(entryValue)])
            .filter(([, entryValue]) => {
                if (entryValue === undefined) return false;
                if (entryValue && typeof entryValue === "object" && !Array.isArray(entryValue)) {
                    return Object.keys(entryValue).length > 0;
                }
                return true;
            })
    );
};

const normalizeAddress = (address, pincode) => {
    if (!address) return undefined;

    if (typeof address === "string") {
        const parts = address
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        return removeUndefined({
            line1: parts[0] || address,
            line2: parts.length > 4 ? parts.slice(1, -3).join(", ") : undefined,
            city: parts.length >= 3 ? parts[parts.length - 3] : undefined,
            state: parts.length >= 2 ? parts[parts.length - 2] : undefined,
            pincode,
            country: parts.length >= 2 ? parts[parts.length - 1] : "India",
        });
    }

    if (typeof address === "object" && !Array.isArray(address)) {
        return removeUndefined({
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode || pincode,
            country: address.country || "India",
        });
    }

    return undefined;
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
        const allowedFields = removeUndefined({
            name: req.body.name,
            dob: req.body.dob,
            phone: req.body.phone,
            email: req.body.email,
            address: normalizeAddress(req.body.address, req.body.pincode),
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
            documents: req.body.documents,
        });

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
