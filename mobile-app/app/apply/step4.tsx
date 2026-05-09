import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Btn from "../../src/components/Btn";
import ProgressBar from "../../src/components/ProgressBar";
import { useUser } from "../../src/context/UserContext";
import { createLoan } from "../../src/services/loanApi";
import { updateProfile } from "../../src/services/userApi";

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

const requiredDocuments = [
    { key: "aadhaar", label: "Aadhaar Card", icon: "badge", kind: "document" },
    { key: "class10Marksheet", label: "Class 10 Marksheet", icon: "school", kind: "document" },
    { key: "class12Marksheet", label: "Class 12 Marksheet", icon: "workspace-premium", kind: "document" },
    { key: "admissionOfferLetter", label: "Admission Offer Letter", icon: "description", kind: "document" },
    { key: "passportPhoto", label: "Passport Size Photo", icon: "photo-camera", kind: "image" },
];

function fileLabel(file: any) {
    if (!file) return "Not uploaded";
    return file.name || file.fileName || "Selected file";
}

export default function Step4({ form = {}, setForm = () => {}, prev }: any) {
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const documents = form.documents || {};

    const saveDocument = (key: string, file: any) => {
        const nextDocuments = {
            ...documents,
            [key]: {
                name: file.name || file.fileName || `${key}-document`,
                uri: file.uri,
                mimeType: file.mimeType || file.type || "",
                size: file.size || file.fileSize || 0,
                uploadedAt: new Date().toISOString(),
            },
        };

        setForm({ ...form, documents: nextDocuments });
    };

    const pickDocument = async (key: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (!result.canceled && result.assets?.[0]) {
                saveDocument(key, result.assets[0]);
            }
        } catch (err: any) {
            alert(err?.message || "Unable to select document");
        }
    };

    const pickPhoto = async (key: string) => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Please allow photo access to upload passport size photo.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]) {
                saveDocument(key, {
                    ...result.assets[0],
                    name: result.assets[0].fileName || "passport-photo.jpg",
                    mimeType: result.assets[0].mimeType || "image/jpeg",
                });
            }
        } catch (err: any) {
            alert(err?.message || "Unable to select photo");
        }
    };

    const missingDocuments = requiredDocuments.filter((item) => !documents[item.key]);

    const handleSubmit = async () => {
        if (missingDocuments.length > 0) {
            alert(`Please upload: ${missingDocuments.map((item) => item.label).join(", ")}`);
            return;
        }

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
                documents,
            };

            console.log("SUBMITTING:", payload);

            const res = await createLoan(payload);
            if (user?._id) {
                const profileRes = await updateProfile(user._id, { documents });
                await setUser(profileRes.data);
            }

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

            <ReviewSection title="Documents" icon="folder">
                {requiredDocuments.map((item) => {
                    const uploaded = documents[item.key];

                    return (
                        <TouchableOpacity
                            key={item.key}
                            activeOpacity={0.84}
                            onPress={() => item.kind === "image" ? pickPhoto(item.key) : pickDocument(item.key)}
                            style={styles.documentRow}
                        >
                            <View style={styles.documentIcon}>
                                <MaterialIcons name={item.icon as any} size={20} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.documentTitle}>{item.label}</Text>
                                <Text numberOfLines={1} style={[styles.documentMeta, uploaded && styles.documentMetaDone]}>
                                    {fileLabel(uploaded)}
                                </Text>
                            </View>
                            <MaterialIcons name={uploaded ? "check-circle" : "upload-file"} size={22} color={uploaded ? theme.success : theme.skyBlue} />
                        </TouchableOpacity>
                    );
                })}
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
    documentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    documentIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.paleBlue,
        alignItems: "center",
        justifyContent: "center",
    },
    documentTitle: {
        color: theme.text,
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 3,
    },
    documentMeta: {
        color: theme.subText,
        fontSize: 12,
        fontWeight: "600",
    },
    documentMetaDone: {
        color: theme.success,
        fontWeight: "800",
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
