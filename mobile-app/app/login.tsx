import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn } from "react-native-reanimated";
import { loginUser } from "../src/services/userApi";
import { useUser } from "../src/context/UserContext";

const theme = {
    primary: "#2F6FED",
    ink: "#172033",
    mint: "#18A999",
    surface: "#F7FAFD",
    white: "#FFFFFF",
    text: "#172033",
    subText: "#758195",
    border: "#E8EEF5",
    softBlue: "#F1F7FF",
    cream: "#FFF8EF",
};

const AnimatedView = Animated.createAnimatedComponent(View);

function FloatingCue({ icon, color, label }: { icon: any; color: string; label: string }) {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.white,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 16,
                paddingVertical: 12,
                shadowColor: "#8AA4C2",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 14,
                elevation: 3,
            }}
        >
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: color, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <MaterialIcons name={icon} size={22} color={theme.white} />
            </View>
            <Text style={{ color: theme.text, fontSize: 11, fontWeight: "900" }}>{label}</Text>
        </View>
    );
}

export default function Login() {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useUser();
    const floatOne = useSharedValue(0);
    const floatTwo = useSharedValue(0);
    const floatThree = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        floatOne.value = withRepeat(withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1, true);
        floatTwo.value = withRepeat(withTiming(5, { duration: 2300, easing: Easing.inOut(Easing.ease) }), -1, true);
        floatThree.value = withRepeat(withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
        pulse.value = withRepeat(withTiming(1.06, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, [floatOne, floatThree, floatTwo, pulse]);

    const floatingOneStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatOne.value }],
    }));

    const floatingTwoStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatTwo.value }],
    }));

    const floatingThreeStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatThree.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const handleLogin = async () => {
        if (!phone.trim()) {
            alert("Enter phone number");
            return;
        }

        try {
            setLoading(true);
            const res = await loginUser(phone.trim());
            await setUser(res.data);
            setTimeout(() => {
                router.replace("/(tabs)/home");
            }, 100);
        } catch (err) {
            console.log(err);
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, backgroundColor: theme.surface }}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
            >
                <AnimatedView entering={FadeInDown.duration(600)} style={{ marginBottom: 18 }}>
                    <View style={{ alignItems: "center", marginBottom: 18 }}>
                        <AnimatedView
                            style={[
                                {
                                    width: 74,
                                    height: 74,
                                    borderRadius: 37,
                                    backgroundColor: "#EAF4FF",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 12,
                                },
                                pulseStyle,
                            ]}
                        >
                            <MaterialIcons name="school" size={37} color={theme.primary} />
                        </AnimatedView>
                        <View style={{ alignItems: "center" }}>
                            <Text
                                style={{
                                    color: "#06245C",
                                    fontSize: 31,
                                    fontWeight: "900",
                                }}
                            >
                                Lo<Text style={{ color: "#0B4FAE" }}>an</Text><Text style={{ color: "#3157D5" }}>Saa</Text><Text style={{ color: "#5B4FE8" }}>rthi</Text>
                            </Text>
                        </View>
                        <Text style={{ color: theme.text, fontSize: 20, lineHeight: 25, fontWeight: "900", marginTop: 8, textAlign: "center", maxWidth: 290 }}>
                            Your education loan journey starts here
                        </Text>
                        <Text style={{ color: theme.subText, fontSize: 13, fontWeight: "700", marginTop: 6, textAlign: "center" }}>
                            Check options before you commit
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: "#EAF4FF",
                            borderRadius: 18,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: "#DDEBFA",
                            marginBottom: 16,
                        }}
                    >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <View>
                                <Text style={{ color: theme.subText, fontSize: 11, fontWeight: "800" }}>POTENTIAL OFFER</Text>
                                <Text style={{ color: "#082F6F", fontSize: 24, fontWeight: "900", marginTop: 2 }}>₹25L</Text>
                            </View>
                            <View style={{ backgroundColor: theme.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                                <Text style={{ color: theme.mint, fontSize: 12, fontWeight: "900" }}>8.5% onwards</Text>
                            </View>
                        </View>
                        <Text style={{ color: theme.subText, fontSize: 11, fontWeight: "700", marginTop: 8 }}>
                            Login to check personalized eligibility and lender matches.
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <AnimatedView entering={ZoomIn.duration(500).delay(120)} style={[{ flex: 1 }, floatingOneStyle]}>
                            <FloatingCue icon="fact-check" color={theme.primary} label="Check" />
                        </AnimatedView>

                        <AnimatedView entering={ZoomIn.duration(500).delay(240)} style={[{ flex: 1 }, floatingTwoStyle]}>
                            <FloatingCue icon="compare-arrows" color={theme.mint} label="Compare" />
                        </AnimatedView>

                        <AnimatedView entering={ZoomIn.duration(500).delay(360)} style={[{ flex: 1 }, floatingThreeStyle]}>
                            <FloatingCue icon="timeline" color="#D9822B" label="Track" />
                        </AnimatedView>
                    </View>
                </AnimatedView>

                <AnimatedView
                    entering={FadeInDown.duration(600).delay(160)}
                    style={{
                        backgroundColor: theme.white,
                        borderRadius: 18,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: theme.border,
                        shadowColor: "#8AA4C2",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.12,
                        shadowRadius: 20,
                        elevation: 4,
                    }}
                >
                    <Text style={{ color: theme.text, fontSize: 19, fontWeight: "900", marginBottom: 5 }}>
                        Enter your mobile number
                    </Text>
                    <Text style={{ color: theme.subText, fontSize: 13, fontWeight: "600", lineHeight: 19, marginBottom: 18 }}>
                        We will create your account automatically if you are new here.
                    </Text>

                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                        PHONE NUMBER
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#FBFCFE",
                            borderWidth: 1,
                            borderColor: theme.border,
                            borderRadius: 14,
                            paddingHorizontal: 14,
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "900", marginRight: 10 }}>+91</Text>
                        <View style={{ width: 1, height: 24, backgroundColor: theme.border, marginRight: 10 }} />
                        <TextInput
                            placeholder="Enter mobile number"
                            keyboardType="number-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                            placeholderTextColor={theme.subText}
                            style={{
                                flex: 1,
                                color: theme.text,
                                fontSize: 16,
                                fontWeight: "700",
                                paddingVertical: 15,
                            }}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={{
                            backgroundColor: theme.primary,
                            paddingVertical: 15,
                            borderRadius: 14,
                            opacity: loading ? 0.72 : 1,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                        }}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={{ color: theme.white, fontSize: 15, fontWeight: "900" }}>
                            {loading ? "PLEASE WAIT..." : "CONTINUE"}
                        </Text>
                        {!loading && <MaterialIcons name="arrow-forward" size={18} color={theme.white} style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                        <MaterialIcons name="shield" size={16} color={theme.mint} />
                        <Text style={{ color: theme.subText, fontSize: 12, fontWeight: "700", marginLeft: 6 }}>
                            Your information stays encrypted and private
                        </Text>
                    </View>
                </AnimatedView>

                <AnimatedView entering={FadeInDown.duration(600).delay(220)} style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1, backgroundColor: theme.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                            <Text style={{ color: theme.primary, fontSize: 19, fontWeight: "900" }}>₹50L</Text>
                            <Text style={{ color: theme.subText, fontSize: 11, fontWeight: "800", marginTop: 4 }}>loan limit</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: theme.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                            <Text style={{ color: theme.mint, fontSize: 19, fontWeight: "900" }}>24 hrs</Text>
                            <Text style={{ color: theme.subText, fontSize: 11, fontWeight: "800", marginTop: 4 }}>quick decision</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: theme.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                            <Text style={{ color: "#D9822B", fontSize: 19, fontWeight: "900" }}>8.5%</Text>
                            <Text style={{ color: theme.subText, fontSize: 11, fontWeight: "800", marginTop: 4 }}>rates from</Text>
                        </View>
                    </View>

                    <Text style={{ marginTop: 18, fontSize: 12, color: theme.subText, textAlign: "center", lineHeight: 18, fontWeight: "600" }}>
                        By continuing, you agree to LoanSaarthi Terms and Privacy Policy.
                    </Text>
                </AnimatedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
