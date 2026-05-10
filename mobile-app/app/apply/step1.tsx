import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Btn from "../../src/components/Btn";
import ProgressBar from "../../src/components/ProgressBar";

const theme = {
    primary: "#003087",
    skyBlue: "#0066CC",
    surface: "#FAFBFC",
    white: "#FFFFFF",
    text: "#1F2937",
    subText: "#6B7280",
    border: "#E5E7EB",
    paleBlue: "#E8F2FF",
};

function Field({ icon, label, value, onChangeText, keyboardType = "default", multiline = false }: any) {
    return (
        <View style={styles.field}>
            <View style={styles.fieldIcon}>
                <MaterialIcons name={icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.fieldBody}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[styles.input, multiline && styles.multiline]}
                    value={value || ""}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                    multiline={multiline}
                />
            </View>
        </View>
    );
}

export default function Step1({ form = {}, setForm = () => {}, next = () => {} }: any) {
    const router = useRouter();

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace("/(tabs)/home");
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity activeOpacity={0.86} onPress={handleBack} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={18} color={theme.primary} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.kicker}>Step 1 of 4</Text>
                <Text style={styles.title}>Personal Details</Text>
                <Text style={styles.subtitle}>
                    Tell us who you are so we can prepare your loan application profile.
                </Text>
            </View>

            <ProgressBar progress={25} />

            <View style={styles.card}>
                <Field
                    icon="person"
                    label="Full Name"
                    value={form.name}
                    onChangeText={(val: string) => handleChange("name", val)}
                />
                <Field
                    icon="email"
                    label="Email"
                    value={form.email}
                    onChangeText={(val: string) => handleChange("email", val)}
                    keyboardType="email-address"
                />
                <Field
                    icon="phone"
                    label="Phone Number"
                    value={form.phone}
                    onChangeText={(val: string) => handleChange("phone", val)}
                    keyboardType="phone-pad"
                />
                <Field
                    icon="home"
                    label="Address"
                    value={form.address}
                    onChangeText={(val: string) => handleChange("address", val)}
                    multiline
                />
                <Field
                    icon="pin-drop"
                    label="Pincode"
                    value={form.pincode}
                    onChangeText={(val: string) => handleChange("pincode", val)}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.actions}>
                <Btn title="Continue" onPress={next} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.surface,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 14,
    },
    backBtn: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        backgroundColor: theme.paleBlue,
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    backText: {
        color: theme.primary,
        fontSize: 13,
        fontWeight: "800",
    },
    kicker: {
        color: theme.skyBlue,
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 6,
    },
    title: {
        color: theme.text,
        fontSize: 26,
        fontWeight: "800",
    },
    subtitle: {
        color: theme.subText,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    card: {
        backgroundColor: theme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        marginTop: 18,
    },
    field: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    fieldIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.paleBlue,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    fieldBody: {
        flex: 1,
    },
    label: {
        color: theme.subText,
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    input: {
        color: theme.text,
        fontSize: 15,
        fontWeight: "600",
        minHeight: 28,
        paddingVertical: 0,
    },
    multiline: {
        minHeight: 54,
        textAlignVertical: "top",
    },
    actions: {
        marginTop: 18,
    },
});
