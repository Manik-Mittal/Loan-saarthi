import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useUser } from "../src/context/UserContext";
import { sendLoginOtp, verifyLoginOtp } from "../src/services/userApi";
import { needsOnboarding } from "../src/utils/profile";

const theme = {
  bg: "#F2F7FF",
  ink: "#0D2447",
  text: "#1A2F53",
  sub: "#647A98",
  card: "#FFFFFF",
  border: "#D5E3F5",
  primary: "#1261FF",
  accent: "#12A38A",
  softBlue: "#E8F0FF",
  softMint: "#E8FAF6",
  white: "#FFFFFF",
};

const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

const AnimatedView = Animated.createAnimatedComponent(View);

function Metric({ label, value, icon, tint }: { label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap; tint: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 12,
      }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: tint, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <MaterialIcons name={icon} size={17} color={theme.white} />
      </View>
      <Text style={{ color: theme.sub, fontSize: 10, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.ink, fontSize: 18, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const bubbleY = useSharedValue(0);
  const bannerY = useSharedValue(0);

  useEffect(() => {
    bubbleY.value = withRepeat(withTiming(-12, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, true);
    bannerY.value = withRepeat(withTiming(-5, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [bannerY, bubbleY]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bubbleY.value }],
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerY.value }],
  }));

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(normalizedPhone)) {
      alert("Enter a valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const res = await sendLoginOtp(normalizedPhone);
      setOtpSent(true);
      if (res.data?.devOtp) {
        alert(`Dev OTP: ${res.data.devOtp}`);
      } else {
        alert("OTP sent to your mobile number");
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedOtp = otp.replace(/\D/g, "").trim();

    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      alert("Enter a valid 10 digit mobile number");
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedOtp)) {
      alert("Enter a valid OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyLoginOtp(normalizedPhone, normalizedOtp);
      const shouldShowOnboarding = res.data?.isNewUser === true || (res.data?.isNewUser !== false && needsOnboarding(res.data));
      const userData = {
        ...res.data,
        isNewUser: res.data?.isNewUser ?? shouldShowOnboarding,
      };
      await setUser(userData);
    const isAdmin = Boolean(ADMIN_PHONE) && normalizedPhone === ADMIN_PHONE;
      setTimeout(() => {
        if (isAdmin) {
          router.replace("/admin-callbacks");
          return;
        }
        router.replace(shouldShowOnboarding ? "/onboarding" : "/(tabs)/home");
      }, 100);
    } catch (err) {
      console.log(err);
      alert((err as any)?.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1 }}>
        <AnimatedView
          style={[
            {
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "#D9E8FF",
              top: -70,
              right: -50,
            },
            bubbleStyle,
          ]}
        />
        <AnimatedView
          style={[
            {
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: "#DBF6F0",
              bottom: -55,
              left: -40,
            },
            bubbleStyle,
          ]}
        />

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AnimatedView entering={FadeInDown.duration(520)} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: theme.softBlue, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="school" size={32} color={theme.primary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: theme.ink, fontSize: 30, fontWeight: "900", lineHeight: 34 }}>LoanSaarthi</Text>
                <Text style={{ color: theme.sub, fontSize: 12, fontWeight: "700" }}>fast-track your study financing</Text>
              </View>
            </View>

            <Text style={{ color: theme.text, fontSize: 23, fontWeight: "900", marginTop: 14, lineHeight: 31 }}>
              Better loan decisions, {"\n"}<Text style={{ color: theme.primary }}>in one clean dashboard</Text>
            </Text>
          </AnimatedView>

          <AnimatedView
            entering={FadeInDown.duration(580).delay(80)}
            style={[
              {
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#CFE0F8",
                backgroundColor: "#123D86",
                padding: 16,
                marginBottom: 14,
                shadowColor: "#123D86",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 4,
              },
              bannerStyle,
            ]}
          >
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "800" }}>PRE-CHECK ELIGIBILITY</Text>
            <Text style={{ color: theme.white, fontSize: 34, fontWeight: "900", marginTop: 4 }}>{"\u20B9"}50L</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "700" }}>Rates from 8.5% p.a.</Text>
              <Text style={{ color: "#A9F3E3", fontSize: 12, fontWeight: "900" }}>24h response</Text>
            </View>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.duration(620).delay(130)} style={{ backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
            <Text style={{ color: theme.ink, fontSize: 18, fontWeight: "900", marginBottom: 4 }}>Login With Mobile</Text>
            <Text style={{ color: theme.sub, fontSize: 13, fontWeight: "600", marginBottom: 13 }}>
              New user accounts are created automatically after OTP verification.
            </Text>

            <Text style={{ color: theme.ink, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>PHONE NUMBER</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: "#FCFEFF", paddingHorizontal: 14, marginBottom: 14 }}>
              <MaterialIcons name="smartphone" size={18} color={theme.primary} />
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: "900", marginLeft: 8 }}>+91</Text>
              <View style={{ width: 1, height: 24, backgroundColor: theme.border, marginHorizontal: 10 }} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 10 digit number"
                keyboardType="number-pad"
                maxLength={10}
                placeholderTextColor={theme.sub}
                style={{ flex: 1, color: theme.ink, fontSize: 16, fontWeight: "700", paddingVertical: 14 }}
              />
            </View>

            {otpSent && (
              <>
                <Text style={{ color: theme.ink, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>OTP</Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: "#FCFEFF", paddingHorizontal: 14, marginBottom: 14 }}>
                  <MaterialIcons name="lock-outline" size={18} color={theme.primary} />
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor={theme.sub}
                    style={{ flex: 1, color: theme.ink, fontSize: 16, fontWeight: "700", paddingVertical: 14, marginLeft: 10 }}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={loading}
              style={{ backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", opacity: loading ? 0.72 : 1 }}
            >
              <Text style={{ color: theme.white, fontSize: 15, fontWeight: "900" }}>
                {loading ? "PLEASE WAIT..." : otpSent ? "VERIFY OTP" : "SEND OTP"}
              </Text>
              {!loading && <MaterialIcons name="arrow-forward" size={18} color={theme.white} style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            {otpSent && (
              <TouchableOpacity activeOpacity={0.84} onPress={handleSendOtp} disabled={loading} style={{ marginTop: 10, alignItems: "center" }}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}>Resend OTP</Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12 }}>
              <MaterialIcons name="verified-user" size={16} color={theme.accent} />
              <Text style={{ color: theme.sub, fontSize: 12, fontWeight: "700", marginLeft: 6 }}>End-to-end encrypted access</Text>
            </View>
          </AnimatedView>

          <AnimatedView entering={FadeInRight.duration(650).delay(180)} style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Metric label="COMPARE" value="15+ lenders" icon="compare-arrows" tint={theme.primary} />
              <Metric label="TRACK" value="Live status" icon="timeline" tint={theme.accent} />
              <Metric label="APPROVAL" value="Fast lane" icon="bolt" tint="#0E89D8" />
            </View>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.duration(620).delay(230)} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.sub, fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 18 }}>
              By continuing, you agree to LoanSaarthi Terms and Privacy Policy.
            </Text>
          </AnimatedView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
