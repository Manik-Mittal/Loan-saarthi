const delhiNcrPincodePrefixes = [
    "110", // Delhi
    "121", // Faridabad / Ballabgarh
    "122", // Gurugram
    "123", // Rewari / nearby NCR
    "124", // Jhajjar / Bahadurgarh / nearby NCR
    "131", // Sonipat
    "201", // Noida / Ghaziabad / Greater Noida
    "203", // Bulandshahr / nearby NCR
    "245", // Hapur / nearby NCR
];

export function normalizePincode(pincode: string) {
    return String(pincode || "").replace(/\D/g, "").slice(0, 6);
}

export function isDelhiNcrPincode(pincode: string) {
    const normalized = normalizePincode(pincode);

    if (!/^\d{6}$/.test(normalized)) {
        return false;
    }

    return delhiNcrPincodePrefixes.some((prefix) => normalized.startsWith(prefix));
}

export function getPincodeServiceMessage(pincode: string) {
    const normalized = normalizePincode(pincode);

    if (normalized.length < 6) {
        return "";
    }

    return isDelhiNcrPincode(normalized)
        ? "Service available for Delhi & NCR"
        : "We currently serve Delhi & NCR pincodes only";
}
