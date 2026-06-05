const User = require("../models/User");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isExpoPushToken = (value) => /^ExponentPushToken\[[^\]]+\]$/.test(String(value || ""));

const sanitizeData = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([, entryValue]) => entryValue !== undefined)
            .map(([entryKey, entryValue]) => [entryKey, entryValue])
    );
};

const normalizePushTokens = (tokens = []) =>
    tokens
        .map((entry) => String(entry?.token || entry || "").trim())
        .filter((token, index, list) => token && isExpoPushToken(token) && list.indexOf(token) === index);

const sendExpoPushNotifications = async ({ tokens, title, body, data }) => {
    const normalizedTokens = normalizePushTokens(tokens);

    if (!normalizedTokens.length) {
        return { sent: 0, tickets: [] };
    }

    const messages = normalizedTokens.map((token) => ({
        to: token,
        sound: "default",
        title: String(title || "").trim(),
        body: String(body || "").trim(),
        data: sanitizeData(data),
    }));

    const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || "Failed to send push notification");
    }

    return {
        sent: normalizedTokens.length,
        tickets: payload?.data || [],
    };
};

const sendNotificationToUser = async ({ userId, title, body, data }) => {
    const user = await User.findById(userId);

    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    const tokens = normalizePushTokens(user.expoPushTokens || []);

    if (!tokens.length) {
        const err = new Error("User has no registered push token. Ask them to open the app on a development build or production app and allow notifications.");
        err.statusCode = 400;
        throw err;
    }

    return sendExpoPushNotifications({ tokens, title, body, data });
};

module.exports = {
    isExpoPushToken,
    normalizePushTokens,
    sendExpoPushNotifications,
    sendNotificationToUser,
};
