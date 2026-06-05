const User = require("../models/User");
const { isExpoPushToken, sendNotificationToUser } = require("../services/pushNotifications");
const { getOtpProvider, sendOtp, verifyOtp } = require("../services/otpService");

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);
const normalizeText = (value) => {
    if (value === undefined || value === null) return undefined;
    return String(value).trim();
};
const normalizeNumber = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

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
            line1: normalizeText(parts[0] || address),
            line2: normalizeText(parts.length > 4 ? parts.slice(1, -3).join(", ") : undefined),
            city: normalizeText(parts.length >= 3 ? parts[parts.length - 3] : undefined),
            state: normalizeText(parts.length >= 2 ? parts[parts.length - 2] : undefined),
            pincode: normalizeText(pincode),
            country: normalizeText(parts.length >= 2 ? parts[parts.length - 1] : "India"),
        });
    }

    if (typeof address === "object" && !Array.isArray(address)) {
        return removeUndefined({
            line1: normalizeText(address.line1),
            line2: normalizeText(address.line2),
            city: normalizeText(address.city),
            state: normalizeText(address.state),
            pincode: normalizeText(address.pincode || pincode),
            country: normalizeText(address.country || "India"),
        });
    }

    return undefined;
};

const normalizeAddressForResponse = (userLike) => {
    const normalized = normalizeAddress(userLike?.address, userLike?.pincode) || {};
    const hasCityState = String(normalized.city || "").trim() && String(normalized.state || "").trim();

    if (!hasCityState && String(normalized.line1 || "").includes(",")) {
        const parsedFromLine1 = normalizeAddress(normalized.line1, normalized.pincode || userLike?.pincode) || {};
        return removeUndefined({
            ...normalized,
            line1: normalized.line1 || parsedFromLine1.line1,
            line2: normalized.line2 || parsedFromLine1.line2,
            city: normalized.city || parsedFromLine1.city,
            state: normalized.state || parsedFromLine1.state,
            pincode: normalized.pincode || parsedFromLine1.pincode || userLike?.pincode,
            country: normalized.country || parsedFromLine1.country || "India",
        });
    }

    return removeUndefined({
        ...normalized,
        pincode: normalized.pincode || userLike?.pincode,
        country: normalized.country || "India",
    });
};

const buildUserResponse = (user, extras = {}) => {
    const userObject = typeof user?.toObject === "function" ? user.toObject() : user;

    return {
        ...userObject,
        address: normalizeAddressForResponse(userObject),
        ...extras,
    };
};

exports.sendLoginOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: "Enter a valid 10 digit mobile number" });
        }

        const result = await sendOtp({ phone });

        return res.json({
            message: "OTP sent",
            provider: getOtpProvider(),
            ...(result?.code ? { devOtp: result.code } : {}),
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

// Create or login user after OTP verification
exports.verifyLoginOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);
        const code = String(req.body.code || "").trim();

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: "Enter a valid 10 digit mobile number" });
        }

        if (!/^\d{4,8}$/.test(code)) {
            return res.status(400).json({ error: "Enter a valid OTP" });
        }

        const isVerified = await verifyOtp({ phone, code });

        if (!isVerified) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const existingUser = await User.findOne({ phone });
        const isNewUser = !existingUser;
        let user = existingUser;

        if (isNewUser) {
            user = await User.create({ phone });
        }

        res.json(
            buildUserResponse(user, {
                isNewUser,
                requiresOnboarding: profileNeedsOnboarding(user)
            })
        );
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

        res.json(buildUserResponse(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const normalizedPhone = req.body.phone !== undefined ? normalizePhone(req.body.phone) : undefined;

        if (normalizedPhone !== undefined && !/^\d{10}$/.test(normalizedPhone)) {
            return res.status(400).json({ error: "Enter a valid 10 digit mobile number" });
        }

        const allowedFields = removeUndefined({
            name: normalizeText(req.body.name),
            dob: normalizeText(req.body.dob),
            phone: normalizedPhone,
            email: normalizeText(req.body.email),
            address: normalizeAddress(req.body.address, req.body.pincode),
            pincode: normalizeText(req.body.pincode),
            pan: normalizeText(req.body.pan),
            gender: normalizeText(req.body.gender),
            marital: normalizeText(req.body.marital),
            education: {
                class10: normalizeNumber(req.body.education?.class10),
                class12: normalizeNumber(req.body.education?.class12),
                school: normalizeText(req.body.education?.school),
                college: normalizeText(req.body.education?.college),
                course: normalizeText(req.body.education?.course),
                year: normalizeText(req.body.education?.year),
                marks: normalizeText(req.body.education?.marks),
            },
            financial: {
                income: normalizeNumber(req.body.financial?.income),
                loanAmount: normalizeText(req.body.financial?.loanAmount),
                duration: normalizeText(req.body.financial?.duration),
                bank: normalizeText(req.body.financial?.bank),
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

        res.json(buildUserResponse(user));
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

exports.registerPushToken = async (req, res) => {
    try {
        const { id } = req.params;
        const token = String(req.body.token || "").trim();
        const platform = normalizeText(req.body.platform);

        if (!isExpoPushToken(token)) {
            return res.status(400).json({ error: "Invalid Expo push token" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingTokens = Array.isArray(user.expoPushTokens) ? user.expoPushTokens : [];
        const nextTokens = existingTokens.filter((entry) => String(entry?.token || "").trim() !== token);

        nextTokens.push({
            token,
            platform,
            updatedAt: new Date(),
        });

        user.expoPushTokens = nextTokens;
        await user.save();

        return res.json(buildUserResponse(user));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.sendAdminNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const title = normalizeText(req.body.title);
        const body = normalizeText(req.body.body);

        if (!title) {
            return res.status(400).json({ error: "Missing required field: title" });
        }

        if (!body) {
            return res.status(400).json({ error: "Missing required field: body" });
        }

        const result = await sendNotificationToUser({
            userId: id,
            title,
            body,
            data: req.body.data,
        });

        return res.json({
            message: "Notification sent",
            ...result,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};
