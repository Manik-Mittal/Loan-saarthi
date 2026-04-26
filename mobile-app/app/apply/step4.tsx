import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import Btn from "../../src/components/Btn";
import ProgressBar from "../../src/components/ProgressBar";
import { useUser } from "../../src/context/UserContext";
import { createLoan } from "../../src/services/loanApi";

const theme = {
    primary: "#003087",
    skyBlue: "#0066CC",
    surface: "#FAFBFC",
    white: "#FFFFFF",
    text: "#1F2937",
    subText: "#6B7280",
    border: "#E5E7EB",
    paleBlue: "#E8F2FF",
    success: "#10B981",
};

function ReviewRow({ label, value }: any) {
    return (
        <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{value || "N/A"}</Text>
        </View>
    );
}

function ReviewSection({ title, icon, children }: any) {
    return (
        <View style={styles.card}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <MaterialIcons name={icon} size={20} color={theme.primary} />
                </View>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
}

export default function Step4({ form = {}, prev }: any) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                userId: user?._id,
                name: form.name,
                phone: form.phone,
                email: form.email,
                address: form.address,
                pincode: form.pincode,
                tenth: form.tenth,
                twelfth: form.twelfth,
                college: form.college,
                course: form.course,
                income: form.income,
                loanAmount: form.loanAmount,
                duration: form.duration,
            };

            console.log("SUBMITTING:", payload);

            const res = await createLoan(payload);

            console.log("RESPONSE:", res.data);
            alert("Loan Submitted");
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.message || "Please try again";
            console.log("ERROR:", err?.response?.data || err.message);
            alert(`Error submitting loan: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.kicker}>Step 4 of 4</Text>
                <Text style={styles.title}>Review & Submit</Text>
                <Text style={styles.subtitle}>
                    Check your details before sending the application for lender review.
                </Text>
            </View>

            <ProgressBar progress={100} />

            <View style={styles.readyBox}>
                <View style={styles.readyIcon}>
                    <MaterialIcons name="verified" size={22} color={theme.success} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.readyTitle}>Application ready</Text>
                    <Text style={styles.readyText}>Your details will be saved after submission.</Text>
                </View>
            </View>

            <ReviewSection title="Personal Information" icon="person">
                <ReviewRow label="Full Name" value={form.name} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Address" value={form.address} />
                <ReviewRow label="Pincode" value={form.pincode} />
            </ReviewSection>

            <ReviewSection title="Education" icon="school">
                <ReviewRow label="10th Score" value={form.tenth} />
                <ReviewRow label="12th Score" value={form.twelfth} />
                <ReviewRow label="College" value={form.college} />
                <ReviewRow label="Course" value={form.course} />
            </ReviewSection>

            <ReviewSection title="Financial Details" icon="payments">
                <ReviewRow label="Annual Income" value={form.income ? `Rs. ${form.income}` : ""} />
                <ReviewRow label="Loan Amount" value={form.loanAmount ? `Rs. ${form.loanAmount}` : ""} />
                <ReviewRow label="Duration" value={form.duration ? `${form.duration} months` : ""} />
            </ReviewSection>

            <View style={styles.actions}>
                {prev && (
                    <View style={styles.actionButton}>
                        <Btn title="Back" onPress={prev} />
                    </View>
                )}
                <View style={styles.actionButton}>
                    <Btn
                        title={loading ? "Submitting..." : "Submit Application"}
                        onPress={handleSubmit}
                        disabled={loading}
                    />
                </View>
            </View>
            {loading && <ActivityIndicator size="large" color={theme.skyBlue} style={{ marginTop: 8 }} />}
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
    readyBox: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        borderRadius: 12,
        padding: 14,
        marginTop: 18,
        marginBottom: 12,
    },
    readyIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: theme.white,
        alignItems: "center",
        justifyContent: "center",
    },
    readyTitle: {
        color: theme.text,
        fontSize: 15,
        fontWeight: "800",
    },
    readyText: {
        color: theme.subText,
        fontSize: 13,
        marginTop: 3,
    },
    card: {
        backgroundColor: theme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: theme.paleBlue,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    sectionTitle: {
        color: theme.text,
        fontSize: 16,
        fontWeight: "800",
    },
    reviewRow: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    reviewLabel: {
        color: theme.subText,
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 4,
    },
    reviewValue: {
        color: theme.text,
        fontSize: 15,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 6,
    },
    actionButton: {
        flex: 1,
    },
});
