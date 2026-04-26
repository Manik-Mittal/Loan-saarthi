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

function Field({ icon, label, value, onChangeText, keyboardType = "default" }: any) {
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
                    keyboardType={keyboardType}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );
}

export default function Step2({ form = {}, setForm = () => {}, next = () => {}, prev = () => {} }: any) {
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
                <Text style={styles.kicker}>Step 2 of 4</Text>
                <Text style={styles.title}>Education Details</Text>
                <Text style={styles.subtitle}>
                    Add your academic background so lenders can assess eligibility accurately.
                </Text>
            </View>

            <ProgressBar progress={50} />

            <View style={styles.card}>
                <Field
                    icon="school"
                    label="10th Board %"
                    value={form.tenth}
                    onChangeText={(val: string) => handleChange("tenth", val)}
                    keyboardType="numeric"
                />
                <Field
                    icon="workspace-premium"
                    label="12th Board %"
                    value={form.twelfth}
                    onChangeText={(val: string) => handleChange("twelfth", val)}
                    keyboardType="numeric"
                />
                <Field
                    icon="account-balance"
                    label="College Name"
                    value={form.college}
                    onChangeText={(val: string) => handleChange("college", val)}
                />
                <Field
                    icon="menu-book"
                    label="Course/Degree"
                    value={form.course}
                    onChangeText={(val: string) => handleChange("course", val)}
                />
            </View>

            <View style={styles.actions}>
                <View style={styles.actionButton}>
                    <Btn title="Back" onPress={prev} />
                </View>
                <View style={styles.actionButton}>
                    <Btn title="Continue" onPress={next} />
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
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    actionButton: {
        flex: 1,
    },
});
