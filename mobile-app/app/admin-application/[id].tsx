import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../../src/context/UserContext";
import { getAdminLoanDocumentUrl, getAllLoansForAdmin } from "../../src/services/loanApi";

const theme = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  ink: "#0F213F",
  body: "#5D6D87",
  primary: "#1555D6",
  border: "#DCE7F4",
  warning: "#E18C2B",
  success: "#159A88",
  paleBlue: "#EAF1FF",
};

const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

const documentLabels: Record<string, string> = {
  aadhaar: "Aadhaar",
  class10Marksheet: "Class 10 Marksheet",
  class12Marksheet: "Class 12 Marksheet",
  admissionOfferLetter: "Admission Offer Letter",
  passportPhoto: "Passport Photo",
};

function getStatusColor(status?: string) {
  if (status === "Approved" || status === "Disbursed") return theme.success;
  if (status === "Rejected") return theme.warning;
  return theme.primary;
}

function formatDate(date?: string) {
  if (!date) return "Recently updated";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: "#EDF2F9" }}>
      <Text style={{ color: theme.body, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: theme.ink, fontSize: 15, fontWeight: "700" }}>{value || "N/A"}</Text>
    </View>
  );
}

function Section({ icon, title, children }: any) {
  return (
    <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: theme.paleBlue,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <MaterialIcons name={icon} size={20} color={theme.primary} />
        </View>
        <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AdminApplicationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useUser();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);
  const isAdmin = Boolean(ADMIN_PHONE) && userPhone === ADMIN_PHONE;

  useEffect(() => {
    let active = true;

    const loadLoan = async () => {
      if (!isAdmin || !params.id) {
        if (active) {
          setError("Application not found.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await getAllLoansForAdmin(userPhone);
        const loans = res.data?.loans || [];
        const selectedLoan = loans.find((item: any) => String(item._id) === String(params.id));

        if (!active) return;

        if (!selectedLoan) {
          setLoan(null);
          setError("Application not found.");
          return;
        }

        setLoan(selectedLoan);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.error || err?.message || "Unable to load application.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLoan();

    return () => {
      active = false;
    };
  }, [isAdmin, params.id, userPhone]);

  const documentEntries = useMemo(
    () => Object.entries(loan?.documents || {}).filter(([, value]: any) => Boolean(value?.key)),
    [loan?.documents]
  );

  const openLoanDocument = async (documentKey: string) => {
    try {
      const res = await getAdminLoanDocumentUrl(userPhone, loan._id, documentKey);
      const downloadUrl = res.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Document link was not returned");
      }

      await Linking.openURL(downloadUrl);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Unable to open document");
    }
  };

  const statusColor = getStatusColor(loan?.status);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.86} style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginBottom: 14 }}>
          <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: "800", marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: "#DCE9FF", borderRadius: 18, padding: 18, marginBottom: 14, overflow: "hidden" }}>
          <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#C8DCFF", top: -85, right: -20 }} />
          <Text style={{ color: theme.body, fontSize: 12, fontWeight: "800" }}>ADMIN APPLICATION VIEW</Text>
          <Text style={{ color: theme.ink, fontSize: 24, fontWeight: "900", marginTop: 4 }}>
            {loan?.applicationNumber || "Application"}
          </Text>
          <Text style={{ color: theme.body, fontSize: 13, marginTop: 8 }}>
            Submitted on {formatDate(loan?.createdAt)}
          </Text>
          <View style={{ alignSelf: "flex-start", backgroundColor: `${statusColor}22`, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7, marginTop: 14 }}>
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: "900" }}>{loan?.status || "In Review"}</Text>
          </View>
        </View>

        {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 36 }} />}

        {!loading && !!error && (
          <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
            <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900" }}>Could not load application</Text>
            <Text style={{ color: theme.body, fontSize: 13, lineHeight: 18, marginTop: 6 }}>{error}</Text>
          </View>
        )}

        {!loading && !error && loan && (
          <>
            <Section icon="person" title="Personal Information">
              <Row label="Full Name" value={loan.name} />
              <Row label="Phone Number" value={loan.phone} />
              <Row label="Email" value={loan.email} />
              <Row label="Address" value={loan.address} />
              <Row label="Pincode" value={loan.pincode} />
            </Section>

            <Section icon="school" title="Education Details">
              <Row label="Class 10 Score" value={loan.tenth} />
              <Row label="Class 12 Score" value={loan.twelfth} />
              <Row label="College" value={loan.college} />
              <Row label="Course" value={loan.course} />
            </Section>

            <Section icon="payments" title="Financial Details">
              <Row label="Annual Family Income" value={loan.income ? `Rs. ${loan.income}` : ""} />
              <Row label="Loan Amount" value={loan.loanAmount ? `Rs. ${loan.loanAmount}` : ""} />
              <Row label="Duration" value={loan.duration ? `${loan.duration} months` : ""} />
            </Section>

            <Section icon="folder" title="Submitted Documents">
              {documentEntries.length === 0 && (
                <Text style={{ color: theme.body, fontSize: 13, fontWeight: "700", paddingVertical: 12 }}>
                  No uploaded documents found for this application.
                </Text>
              )}
              {documentEntries.map(([documentKey, document]: any) => (
                <TouchableOpacity
                  key={documentKey}
                  onPress={() => openLoanDocument(documentKey)}
                  activeOpacity={0.86}
                  style={{
                    paddingVertical: 11,
                    borderTopWidth: 1,
                    borderTopColor: "#EDF2F9",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.body, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>
                      {documentLabels[documentKey] || documentKey}
                    </Text>
                    <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "700" }}>
                      {document.originalName || document.name || "Uploaded document"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <MaterialIcons name="visibility" size={18} color={theme.primary} />
                    <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}>Open</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}
