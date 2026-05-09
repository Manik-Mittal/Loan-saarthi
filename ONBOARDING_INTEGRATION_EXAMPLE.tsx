// ============================================================================
// ONBOARDING.TSX - LOCATION INTEGRATION EXAMPLE
// ============================================================================

import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState, useEffect } from "react"; // ADD useEffect HERE
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUser } from "../src/context/UserContext";
import { useLocation } from "../src/hooks/useLocation"; // ← ADD THIS IMPORT
import { LocationData, detectLocation } from "../src/services/locationService"; // ← ADD THIS IMPORT
import { updateProfile } from "../src/services/userApi";

const theme = {
    primary: "#2F6FED",
    ink: "#172033",
    mint: "#18A999",
    surface: "#F7FAFD",
    white: "#FFFFFF",
    text: "#172033",
    subText: "#758195",
    border: "#E8EEF5",
    lightGray: "#F1F5FA",
    paleBlue: "#EDF5FF",
};

// ... (keep all the existing Field, DateField, CalendarModal, GenderModal components as they are)

// ============================================================================
// MAIN COMPONENT - ADD LOCATION STATE HERE
// ============================================================================

export default function Onboarding() {
    const router = useRouter();
    const { user, setUser, loading } = useUser();

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ ADD THESE NEW STATES FOR LOCATION
    // ─────────────────────────────────────────────────────────────────────────
    const [locationStep, setLocationStep] = useState<"checking" | "verified" | "failed" | null>(null);
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: user?.name || "",
        dob: user?.dob || "",
        gender: user?.gender || "",
        address: user?.address || "",
        pincode: user?.pincode || "",
    });

    // ... existing states remain the same
    const [genderOpen, setGenderOpen] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ ADD THIS useEffect TO CHECK LOCATION ON LOAD
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const checkLocationOnLoad = async () => {
            setLocationStep("checking");
            try {
                const location = await detectLocation();

                if (!location) {
                    setLocationError("Could not detect your location. Please enable location services.");
                    setLocationStep("failed");
                    return;
                }

                setUserLocation(location);

                if (!location.isServiceable) {
                    setLocationError(
                        `Our service is not available in ${location.city} yet. We currently serve Delhi & NCR only.`
                    );
                    setLocationStep("failed");
                } else {
                    setLocationStep("verified");
                }
            } catch (err) {
                setLocationError("Error detecting location. Please try again.");
                setLocationStep("failed");
            }
        };

        // Only check if user exists
        if (!loading && user) {
            checkLocationOnLoad();
        }
    }, [loading, user]);

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING LOADING & REDIRECT LOGIC (NO CHANGES)
    // ─────────────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.surface }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ SHOW LOCATION CHECK SCREEN WHILE CHECKING
    // ─────────────────────────────────────────────────────────────────────────
    if (locationStep === "checking") {
        return (
            <View style={{ flex: 1, backgroundColor: theme.surface, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 16, fontSize: 15, color: theme.text, fontWeight: "600" }}>
                    Checking your location...
                </Text>
                <Text style={{ marginTop: 8, fontSize: 12, color: theme.subText }}>
                    Verifying service availability
                </Text>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ SHOW ERROR SCREEN IF LOCATION NOT SERVICEABLE
    // ─────────────────────────────────────────────────────────────────────────
    if (locationStep === "failed") {
        return (
            <View style={{ flex: 1, backgroundColor: theme.surface, justifyContent: "center", padding: 20 }}>
                <View style={{ alignItems: "center", marginBottom: 30 }}>
                    <View
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 34,
                            backgroundColor: "#FFE8E8",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 14,
                        }}
                    >
                        <MaterialIcons name="location-off" size={34} color="#D32F2F" />
                    </View>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 10 }}>
                        Service Not Available
                    </Text>
                    <Text style={{ color: theme.subText, fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 20 }}>
                        {locationError}
                    </Text>
                </View>

                {userLocation && (
                    <View
                        style={{
                            backgroundColor: theme.white,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: theme.border,
                            marginBottom: 30,
                        }}
                    >
                        <Text style={{ color: theme.subText, fontSize: 12, fontWeight: "700", marginBottom: 8 }}>
                            DETECTED LOCATION
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "800", marginBottom: 4 }}>
                            {userLocation.city}, {userLocation.state}
                        </Text>
                        <Text style={{ color: theme.subText, fontSize: 12 }}>
                            Latitude: {userLocation.latitude.toFixed(4)}
                        </Text>
                        <Text style={{ color: theme.subText, fontSize: 12 }}>
                            Longitude: {userLocation.longitude.toFixed(4)}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                        // Allow retry or exit
                        router.replace("/login");
                    }}
                    style={{
                        backgroundColor: theme.primary,
                        borderRadius: 12,
                        paddingVertical: 15,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: theme.white, fontSize: 15, fontWeight: "900" }}>
                        BACK TO LOGIN
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING FORM FUNCTIONS (NO CHANGES)
    // ─────────────────────────────────────────────────────────────────────────
    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!form.name.trim()) return "Please enter your full name.";
        if (!form.dob.trim()) return "Please enter your date of birth.";
        if (!form.gender.trim()) return "Please select your gender.";
        if (!form.address.trim()) return "Please enter your address.";
        if (!/^\d{6}$/.test(form.pincode.trim())) return "Please enter a valid 6 digit pincode.";
        return "";
    };

    const handleSubmit = async () => {
        const message = validate();
        if (message) {
            setError(message);
            return;
        }

        try {
            setSaving(true);
            setError("");

            // ─────────────────────────────────────────────────────────────────────
            // ✅ OPTIONALLY: SEND LOCATION TO BACKEND
            // ─────────────────────────────────────────────────────────────────────
            const payload = {
                ...user,
                name: form.name.trim(),
                dob: form.dob.trim(),
                gender: form.gender.trim(),
                address: form.address.trim(),
                pincode: form.pincode.trim(),
                // OPTIONAL: Send location info
                location: {
                    city: userLocation?.city,
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude,
                },
            };

            const res = await updateProfile(user._id, payload);
            await setUser(res.data);
            router.replace("/(tabs)/home");
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Unable to update profile");
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ SHOW FORM WITH LOCATION BADGE (ONLY IF VERIFIED)
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: theme.surface }}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
            >
                <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: "center", marginBottom: 20 }}>
                    <View
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 20,
                            backgroundColor: theme.paleBlue,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 14,
                        }}
                    >
                        <MaterialIcons name="person-add-alt-1" size={34} color={theme.primary} />
                    </View>
                    <Text style={{ color: theme.text, fontSize: 27, fontWeight: "900", textAlign: "center" }}>
                        Complete your profile
                    </Text>
                    <Text style={{ color: theme.subText, fontSize: 14, fontWeight: "700", textAlign: "center", marginTop: 7, lineHeight: 20 }}>
                        We need a few details before checking personalized loan options.
                    </Text>

                    {/* ✅ ADD LOCATION BADGE HERE */}
                    {userLocation && locationStep === "verified" && (
                        <View
                            style={{
                                marginTop: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: "#E8F5E9",
                                borderRadius: 20,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <MaterialIcons name="location-on" size={14} color="#2E7D32" />
                            <Text style={{ color: "#2E7D32", fontSize: 12, fontWeight: "700" }}>
                                {userLocation.city} ✓
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.duration(600).delay(120)}
                    style={{
                        backgroundColor: theme.white,
                        borderRadius: 16,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: theme.border,
                        shadowColor: "#8AA4C2",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.1,
                        shadowRadius: 18,
                        elevation: 3,
                    }}
                >
                    {/* ALL EXISTING FORM FIELDS - NO CHANGES NEEDED */}
                    <Field label="FULL NAME" value={form.name} onChangeText={(value: string) => updateField("name", value)} placeholder="Enter your full name" />
                    <DateField label="DATE OF BIRTH" value={form.dob} onPress={() => setDatePickerOpen(true)} />

                    <View style={{ marginBottom: 14 }}>
                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                            GENDER
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.84}
                            onPress={() => setGenderOpen(true)}
                            style={{
                                backgroundColor: "#FBFCFE",
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 12,
                                minHeight: 50,
                                paddingHorizontal: 14,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{ color: form.gender ? theme.text : theme.subText, fontSize: 15, fontWeight: "700" }}>
                                {form.gender || "Select gender"}
                            </Text>
                            <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.subText} />
                        </TouchableOpacity>
                    </View>

                    <Field label="ADDRESS" value={form.address} onChangeText={(value: string) => updateField("address", value)} placeholder="Enter your address" multiline />
                    <Field label="PINCODE" value={form.pincode} onChangeText={(value: string) => updateField("pincode", value)} placeholder="6 digit pincode" keyboardType="number-pad" />

                    {!!error && (
                        <Text style={{ color: "#B45309", fontSize: 13, fontWeight: "700", marginBottom: 14 }}>
                            {error}
                        </Text>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={handleSubmit}
                        disabled={saving}
                        style={{
                            backgroundColor: theme.primary,
                            borderRadius: 12,
                            paddingVertical: 15,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            opacity: saving ? 0.72 : 1,
                        }}
                    >
                        <Text style={{ color: theme.white, fontSize: 15, fontWeight: "900" }}>
                            {saving ? "SAVING..." : "SAVE PROFILE"}
                        </Text>
                        {!saving && <MaterialIcons name="arrow-forward" size={18} color={theme.white} style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* KEEP EXISTING MODALS - NO CHANGES */}
            <GenderModal
                visible={genderOpen}
                value={form.gender}
                onClose={() => setGenderOpen(false)}
                onSelect={(value: string) => {
                    updateField("gender", value);
                    setGenderOpen(false);
                }}
            />
            <CalendarModal
                visible={datePickerOpen}
                value={form.dob}
                onClose={() => setDatePickerOpen(false)}
                onSelect={(value: string) => {
                    updateField("dob", value);
                    setDatePickerOpen(false);
                }}
            />
        </View>
    );
}
