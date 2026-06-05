import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../../src/context/UserContext";
import { getLoansByUser } from "../../src/services/loanApi";

const theme = {
  primary: "#195BFF",
  iconAccent: "#17A589",
  paleBlue: "#EAF2FF",
  surface: "#EEF3F9",
  white: "#FFFFFF",
  text: "#10223F",
  subText: "#60718B",
  border: "#D8E3F2",
  warning: "#D98A24",
  success: "#17A589",
};

const documentLabels: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  class10Marksheet: "Class 10 Marksheet",
  class12Marksheet: "Class 12 Marksheet",
  admissionOfferLetter: "Admission Offer Letter",
  passportPhoto: "Passport Size Photo",
};

function formatDate(date?: string) {
  if (!date) return "Recently updated";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status?: string) {
  return String(status || "").toLowerCase() === "approved" ? theme.success : theme.warning;
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: "#EEF3F8" }}>
      <Text style={{ color: theme.subText, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 15, fontWeight: "700" }}>{value || "N/A"}</Text>
    </View>
  );
}

function Section({ icon, title, children }: any) {
  return (
    <View
      style={{
        backgroundColor: theme.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        marginBottom: 14,
      }}
    >
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
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useUser();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLoan = async () => {
      if (!user?._id || !params.id) {
        if (active) {
          setError("Application not found.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await getLoansByUser(user._id);
        const loans = res.data?.loans || res.data || [];
        const selectedLoan = loans.find((item: any) => String(item._id) === String(params.id));

        if (!active) {
          return;
        }

        if (!selectedLoan) {
          setError("Application not found.");
          setLoan(null);
          return;
        }

        setLoan(selectedLoan);
      } catch (err: any) {
        if (!active) {
          return;
        }
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
  }, [params.id, user?._id]);

  const documentEntries = useMemo(
    () => Object.entries(loan?.documents || {}).filter(([, value]: any) => Boolean(value)),
    [loan?.documents]
  );

  const statusColor = getStatusColor(loan?.status);

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginBottom: 16 }}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: "800", marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: "#DCE9FF",
            borderRadius: 22,
            padding: 18,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#C8DCFF", top: -80, right: -20 }} />
          <Text style={{ color: theme.subText, fontSize: 12, fontWeight: "800" }}>SUBMITTED APPLICATION</Text>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900", marginTop: 4 }}>
            {loan?.applicationNumber || "Application"}
          </Text>
          <Text style={{ color: theme.subText, fontSize: 13, lineHeight: 19, marginTop: 8 }}>
            Submitted on {formatDate(loan?.createdAt)}
          </Text>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: `${statusColor}18`,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 7,
              marginTop: 14,
            }}
          >
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: "900" }}>{loan?.status || "In Review"}</Text>
          </View>
        </View>

        {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />}

        {!loading && !!error && (
          <View style={{ backgroundColor: theme.white, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 18 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>Could not load application</Text>
            <Text style={{ color: theme.subText, fontSize: 13, lineHeight: 19, marginTop: 6 }}>{error}</Text>
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
                <Text style={{ color: theme.subText, fontSize: 13, fontWeight: "700", paddingVertical: 12 }}>
                  No documents were attached to this application.
                </Text>
              )}

              {documentEntries.map(([key, value]: any) => (
                <Row
                  key={key}
                  label={documentLabels[key] || key}
                  value={value?.originalName || value?.name || value?.key || "Uploaded"}
                />
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}
