import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import Btn from "../../src/components/Btn";
import ProgressBar from "../../src/components/ProgressBar";
import { useUser } from "../../src/context/UserContext";
import { createLoan, requestLoanDocumentUpload, reserveLoanApplicationNumber } from "../../src/services/loanApi";
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
    { key: "aadhaar", label: "Aadhaar Card", icon: "badge", kind: "document", allowed: "PDF, JPG, PNG" },
    { key: "class10Marksheet", label: "Class 10 Marksheet", icon: "school", kind: "document", allowed: "PDF, JPG, PNG" },
    { key: "class12Marksheet", label: "Class 12 Marksheet", icon: "workspace-premium", kind: "document", allowed: "PDF, JPG, PNG" },
    { key: "admissionOfferLetter", label: "Admission Offer Letter", icon: "description", kind: "document", allowed: "PDF, JPG, PNG" },
    { key: "passportPhoto", label: "Passport Size Photo", icon: "photo-camera", kind: "image", allowed: "JPG, PNG" },
];

function fileLabel(file: any) {
    if (!file) return "Not uploaded";
    return file.name || file.originalName || file.fileName || "Selected file";
}

const requiredFormFields = [
    { key: "name", label: "Full Name" },
    { key: "phone", label: "Phone Number" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "pincode", label: "Pincode" },
    { key: "tenth", label: "10th Board %" },
    { key: "twelfth", label: "12th Board %" },
    { key: "college", label: "College Name" },
    { key: "course", label: "Course/Degree" },
    { key: "income", label: "Annual Family Income" },
    { key: "loanAmount", label: "Loan Amount Required" },
    { key: "duration", label: "Loan Duration Months" },
];

const extensionToMimeType: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
};

function getFileExtension(file: any) {
    const source = String(file?.name || file?.fileName || file?.uri || "");
    const match = source.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/);
    return match?.[1] || "";
}

function inferMimeType(file: any, documentType: string) {
    const provided = String(file?.mimeType || file?.type || "").split(";")[0].trim().toLowerCase();
    if (provided && provided !== "application/octet-stream") {
        return provided === "image/jpg" ? "image/jpeg" : provided;
    }

    const extension = getFileExtension(file);
    if (extensionToMimeType[extension]) {
        return extensionToMimeType[extension];
    }

    return documentType === "passportPhoto" ? "image/jpeg" : "application/pdf";
}

function fileNameWithExtension(fileName: string, mimeType: string) {
    if (/\.(pdf|jpe?g|png)$/i.test(fileName)) {
        return fileName;
    }

    const extension = Object.entries(extensionToMimeType).find(([, value]) => value === mimeType)?.[0];
    return extension ? `${fileName}.${extension === "jpeg" ? "jpg" : extension}` : fileName;
}

async function getLocalFileSize(file: any) {
    if (Number(file?.size || file?.fileSize || 0) > 0) {
        return Number(file.size || file.fileSize);
    }

    if (!file?.uri) {
        return 0;
    }

    if (Platform.OS === "web") {
        try {
            const fileRes = await fetch(file.uri);
            const blob = await fileRes.blob();
            return Number(blob.size || 0);
        } catch {
            return 0;
        }
    }

    try {
        const info = await FileSystem.getInfoAsync(file.uri);
        return info.exists ? Number(info.size || 0) : 0;
    } catch {
        return 0;
    }
}

async function uploadLocalFileToUrl({
    uploadUrl,
    file,
    headers,
    method,
    mimeType,
}: {
    uploadUrl: string;
    file: any;
    headers?: Record<string, string>;
    method?: string;
    mimeType: string;
}) {
    if (Platform.OS === "web") {
        const fileRes = await fetch(file.uri);
        const blob = await fileRes.blob();
        const uploadRes = await fetch(uploadUrl, {
            method: method || "PUT",
            headers: headers || { "Content-Type": mimeType },
            body: blob,
        });

        return {
            status: uploadRes.status,
        };
    }

    return FileSystem.uploadAsync(uploadUrl, file.uri, {
        httpMethod: (method || "PUT") as "POST" | "PUT" | "PATCH",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
        headers: headers || { "Content-Type": mimeType },
    });
}

export default function Step4({ form = {}, setForm = () => {}, prev }: any) {
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
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

    const ensureApplicationNumber = async () => {
        if (String(form.applicationNumber || "").trim()) {
            return String(form.applicationNumber).trim();
        }

        const res = await reserveLoanApplicationNumber();
        const applicationNumber = String(res.data?.applicationNumber || "").trim();

        if (!applicationNumber) {
            throw new Error("Unable to reserve application number. Please try again.");
        }

        setForm({ ...form, applicationNumber });
        return applicationNumber;
    };

    const uploadDocumentToR2 = async (applicationNumber: string, documentType: string, file: any) => {
        if (file.key) {
            return file;
        }

        if (!file.uri) {
            throw new Error(`${fileLabel(file)} is missing a local file URI. Please reselect it.`);
        }

        const mimeType = inferMimeType(file, documentType);
        const fileName = fileNameWithExtension(file.name || file.fileName || `${documentType}-document`, mimeType);
        const size = await getLocalFileSize(file);

        if (!size) {
            throw new Error(`Unable to read ${fileLabel(file)}. Please reselect the file and try again.`);
        }

        const presignRes = await requestLoanDocumentUpload({
            userId: user?._id,
            applicationNumber,
            documentType,
            fileName,
            mimeType,
            size,
        });
        const { uploadUrl, headers, method, document } = presignRes.data;
        const uploadRes = await uploadLocalFileToUrl({
            uploadUrl,
            file,
            headers,
            method,
            mimeType,
        });

        if (uploadRes.status < 200 || uploadRes.status >= 300) {
            throw new Error(`Unable to upload ${fileLabel(file)}. Storage returned ${uploadRes.status}.`);
        }

        return {
            ...document,
            uploadedAt: new Date().toISOString(),
        };
    };

    const uploadAllDocuments = async (applicationNumber: string) => {
        const uploadedDocuments: any = {};

        for (const item of requiredDocuments) {
            setSubmitStatus(`Uploading ${item.label}...`);
            uploadedDocuments[item.key] = await uploadDocumentToR2(applicationNumber, item.key, documents[item.key]);
        }

        return uploadedDocuments;
    };

    const handleSubmit = async () => {
        if (missingDocuments.length > 0) {
            alert(`Please upload: ${missingDocuments.map((item) => item.label).join(", ")}`);
            return;
        }

        const missingFields = requiredFormFields.filter((item) => !String(form[item.key] || "").trim());
        if (missingFields.length > 0) {
            alert(`Please complete: ${missingFields.map((item) => item.label).join(", ")}`);
            return;
        }

        if (!user?._id) {
            alert("Please login again before submitting your loan application.");
            return;
        }

        try {
            setLoading(true);
            setSubmitStatus("Creating application number...");
            const applicationNumber = await ensureApplicationNumber();
            setSubmitStatus("Preparing documents...");
            const uploadedDocuments = await uploadAllDocuments(applicationNumber);
            const payload = {
                userId: user?._id,
                applicationNumber,
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
                documents: uploadedDocuments,
            };

            console.log("SUBMITTING:", payload);

            setSubmitStatus("Submitting application...");
            const res = await createLoan(payload);
            if (user?._id) {
                try {
                    const profileRes = await updateProfile(user._id, { documents: uploadedDocuments });
                    await setUser(profileRes.data);
                } catch (profileErr: any) {
                    console.log("PROFILE DOCUMENT SYNC ERROR:", profileErr?.response?.data || profileErr.message);
                }
            }

            setForm({ ...form, applicationNumber, documents: uploadedDocuments });
            console.log("RESPONSE:", res.data);
            alert(`Loan Submitted. Application Number: ${applicationNumber}`);
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.message || "Please try again";
            console.log("ERROR:", err?.response?.data || err.message);
            alert(`Error submitting loan: ${message}`);
        } finally {
            setLoading(false);
            setSubmitStatus("");
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
                <View style={styles.documentHintBox}>
                    <MaterialIcons name="info-outline" size={18} color={theme.skyBlue} />
                    <Text style={styles.documentHintText}>
                        Allowed file types: PDF, JPG, PNG. Passport photo accepts JPG or PNG.
                    </Text>
                </View>
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
                                <Text style={styles.documentAllowed}>Allowed: {item.allowed}</Text>
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
                        title={loading ? submitStatus || "Submitting..." : "Submit Application"}
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
    documentHintBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.paleBlue,
        borderRadius: 10,
        padding: 10,
        marginBottom: 4,
    },
    documentHintText: {
        flex: 1,
        color: theme.primary,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 17,
    },
    documentTitle: {
        color: theme.text,
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 3,
    },
    documentAllowed: {
        color: theme.subText,
        fontSize: 11,
        fontWeight: "700",
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
