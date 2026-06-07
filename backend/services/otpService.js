const OtpCode = require("../models/OtpCode");

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 45);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const normalizePhoneE164 = (phone) => `+91${String(phone || "").replace(/\D/g, "").slice(-10)}`;

const getOtpProvider = () => {
    if (String(process.env.OTP_PROVIDER || "").trim()) {
        return String(process.env.OTP_PROVIDER).trim().toLowerCase();
    }

    if (
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_VERIFY_SERVICE_SID
    ) {
        return "twilio-verify";
    }

    return "dev";
};

const encodeFormBody = (payload) =>
    new URLSearchParams(
        Object.entries(payload).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
                acc[key] = String(value);
            }
            return acc;
        }, {})
    ).toString();

const sendViaTwilioVerify = async ({ phone }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        throw new Error("Missing Twilio Verify configuration");
    }

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeFormBody({
            To: normalizePhoneE164(phone),
            Channel: "sms",
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.message || "Unable to send OTP");
    }

    return {
        provider: "twilio-verify",
        sid: payload.sid,
    };
};

const verifyViaTwilioVerify = async ({ phone, code }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        throw new Error("Missing Twilio Verify configuration");
    }

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeFormBody({
            To: normalizePhoneE164(phone),
            Code: code,
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.message || "Unable to verify OTP");
    }

    return payload?.status === "approved";
};

const sendViaDevOtp = async ({ phone }) => {
    const now = new Date();
    const existing = await OtpCode.findOne({ phone });

    if (existing && existing.createdAt) {
        const secondsSinceLastSend = Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
        if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
            const retryAfterSeconds = OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend;
            const err = new Error(`Please wait ${retryAfterSeconds}s before requesting another OTP`);
            err.statusCode = 429;
            throw err;
        }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    await OtpCode.findOneAndUpdate(
        { phone },
        {
            phone,
            code,
            expiresAt,
            attempts: 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`DEV OTP for ${phone}: ${code}`);

    return {
        provider: "dev",
        code: process.env.OTP_HIDE_DEV_CODE === "true" ? undefined : code,
    };
};

const verifyViaDevOtp = async ({ phone, code }) => {
    const entry = await OtpCode.findOne({ phone });

    if (!entry) {
        return false;
    }

    if (entry.expiresAt.getTime() < Date.now()) {
        await OtpCode.deleteOne({ _id: entry._id });
        return false;
    }

    entry.attempts += 1;

    if (entry.attempts > OTP_MAX_ATTEMPTS) {
        await OtpCode.deleteOne({ _id: entry._id });
        const err = new Error("Too many invalid OTP attempts");
        err.statusCode = 429;
        throw err;
    }

    if (String(entry.code) !== String(code)) {
        await entry.save();
        return false;
    }

    await OtpCode.deleteOne({ _id: entry._id });
    return true;
};

const sendOtp = async ({ phone }) => {
    const provider = getOtpProvider();

    if (provider === "twilio-verify") {
        return sendViaTwilioVerify({ phone });
    }

    return sendViaDevOtp({ phone });
};

const verifyOtp = async ({ phone, code }) => {
    const provider = getOtpProvider();

    if (provider === "twilio-verify") {
        return verifyViaTwilioVerify({ phone, code });
    }

    return verifyViaDevOtp({ phone, code });
};

module.exports = {
    getOtpProvider,
    sendOtp,
    verifyOtp,
};
