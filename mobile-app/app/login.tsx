import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { colors } from "../src/constants/colors";
import { loginUser } from "../src/services/userApi";
import { useUser } from "../src/context/UserContext";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { setUser } = useUser();

    const handleLogin = async () => {
        if (!phone) {
            alert("Enter phone number");
            return;
        }

        try {
            setLoading(true);

            const res = await loginUser(phone);

            console.log("USER:", res.data);

            setUser(res.data);

            // small delay (safe navigation)
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
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                padding: 20,
                justifyContent: "center",
            }}
        >
            <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 10 }}>
                LoanSaarthi
            </Text>

            <Text style={{ color: colors.subText, marginBottom: 30 }}>
                Get instant education loans easily
            </Text>

            <Text style={{ marginBottom: 6 }}>Phone Number</Text>

            <TextInput
                placeholder="Enter your phone"
                keyboardType="numeric"
                value={phone}
                onChangeText={setPhone}
                style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 20,
                }}
            />

            <TouchableOpacity
                style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 10,
                    opacity: loading ? 0.7 : 1,
                }}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text
                    style={{
                        color: "#fff",
                        textAlign: "center",
                        fontWeight: "600",
                    }}
                >
                    {loading ? "Loading..." : "Continue"}
                </Text>
            </TouchableOpacity>

            <Text
                style={{
                    textAlign: "center",
                    marginVertical: 20,
                    color: colors.subText,
                }}
            >
                OR
            </Text>

            <TouchableOpacity
                style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    padding: 14,
                    borderRadius: 10,
                }}
            >
                <Text style={{ textAlign: "center" }}>Continue with Google</Text>
            </TouchableOpacity>

            <Text
                style={{
                    marginTop: 20,
                    fontSize: 12,
                    color: colors.subText,
                    textAlign: "center",
                }}
            >
                By continuing, you agree to our Terms & Privacy Policy
            </Text>
        </View>
    );
}