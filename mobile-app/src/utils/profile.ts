export function needsOnboarding(user: any) {
    if (!user) return false;
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
}
