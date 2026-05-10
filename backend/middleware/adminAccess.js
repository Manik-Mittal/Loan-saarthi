const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

const getAllowedAdminPhones = () =>
    String(process.env.ADMIN_PHONE || "")
        .split(",")
        .map((phone) => normalizePhone(phone))
        .filter(Boolean);

const requireAdminPhone = (req, res, next) => {
    const incoming = normalizePhone(req.headers["x-admin-phone"]);
    const allowed = getAllowedAdminPhones();

    if (!incoming) {
        return res.status(401).json({ error: "Missing admin phone header" });
    }

    if (!allowed.length) {
        return res.status(500).json({ error: "Admin phone is not configured on server" });
    }

    if (!allowed.includes(incoming)) {
        return res.status(403).json({ error: "Unauthorized admin access" });
    }

    return next();
};

module.exports = { requireAdminPhone };
