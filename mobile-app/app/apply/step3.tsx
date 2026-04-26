import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

function Field({ icon, label, value, onChangeText }: any) {
    return (
        <View style={styles.field}>
            <View style={styles.fieldIcon}>
                <MaterialIcons name={icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.fieldBody}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={value || ""}
                    onChangeText={onChangeText}
                    keyboardType="numeric"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );
}

export default function Step3({ form = {}, setForm = () => {}, next = () => {}, prev = () => {} }: any) {
    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.kicker}>Step 3 of 4</Text>
                <Text style={styles.title}>Financial Details</Text>
                <Text style={styles.subtitle}>
                    Share the amount you need and a repayment duration that fits your plan.
                </Text>
            </View>

            <ProgressBar progress={75} />

            <View style={styles.infoBox}>
                <MaterialIcons name="tips-and-updates" size={20} color={theme.skyBlue} />
                <Text style={styles.infoText}>
                    Use annual income and total requested amount in rupees.
                </Text>
            </View>

            <View style={styles.card}>
                <Field
                    icon="account-balance-wallet"
                    label="Annual Family Income"
                    value={form.income}
                    onChangeText={(val: string) => handleChange("income", val)}
                />
                <Field
                    icon="payments"
                    label="Loan Amount Required"
                    value={form.loanAmount}
                    onChangeText={(val: string) => handleChange("loanAmount", val)}
                />
                <Field
                    icon="event"
                    label="Loan Duration Months"
                    value={form.duration}
                    onChangeText={(val: string) => handleChange("duration", val)}
                />
            </View>

            <View style={styles.actions}>
                <View style={styles.actionButton}>
                    <Btn title="Back" onPress={prev} />
                </View>
                <View style={styles.actionButton}>
                    <Btn title="Review" onPress={next} />
                </View>
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
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.paleBlue,
        borderRadius: 12,
        padding: 12,
        marginTop: 18,
    },
    infoText: {
        flex: 1,
        color: theme.primary,
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 18,
    },
    card: {
        backgroundColor: theme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        marginTop: 12,
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
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    actionButton: {
        flex: 1,
    },
});
