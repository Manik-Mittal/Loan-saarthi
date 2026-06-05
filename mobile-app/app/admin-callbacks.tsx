import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "../src/context/UserContext";
import { getCallbackRequests, updateCallbackRequestStatus } from "../src/services/callbackApi";
import { getAdminLoanDocumentUrl, getAllLoansForAdmin, updateLoanStatusForAdmin } from "../src/services/loanApi";
import { sendAdminNotificationToUser } from "../src/services/userApi";

const theme = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  ink: "#0F213F",
  body: "#5D6D87",
  primary: "#1555D6",
  border: "#DCE7F4",
  warning: "#E18C2B",
  success: "#159A88",
};

const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

const documentLabels: Record<string, string> = {
  aadhaar: "Aadhaar",
  class10Marksheet: "Class 10",
  class12Marksheet: "Class 12",
  admissionOfferLetter: "Admission Letter",
  passportPhoto: "Photo",
};

type CallbackItem = {
  _id: string;
  name?: string;
  phone: string;
  email?: string;
  preferredTime?: string;
  message?: string;
  status: "Pending" | "Contacted" | "Resolved";
};

type LoanItem = {
  _id: string;
  userId?: string;
  applicationNumber?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  pincode?: string;
  tenth?: string;
  twelfth?: string;
  college?: string;
  course?: string;
  income?: string;
  loanAmount?: string;
  duration?: string;
  documents?: Record<string, { key?: string; name?: string; originalName?: string }>;
  status?: "In Review" | "Approved" | "Rejected" | "Disbursed";
};

export default function AdminPortalScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"callbacks" | "loans">("callbacks");
  const [callbacks, setCallbacks] = useState<CallbackItem[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notificationLoan, setNotificationLoan] = useState<LoanItem | null>(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  const userPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);
  const isAdmin = Boolean(ADMIN_PHONE) && userPhone === ADMIN_PHONE;

  const load = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      setError("");
      const [callbackRes, loanRes] = await Promise.all([
        getCallbackRequests(userPhone),
        getAllLoansForAdmin(userPhone),
      ]);
      setCallbacks(callbackRes.data?.callbacks || []);
      setLoans(loanRes.data?.loans || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Unable to load admin portal data");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userPhone]);

  const handleBack = () => {
    router.replace(user ? "/(tabs)/home" : "/login");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateCallbackStatus = async (id: string, status: "Pending" | "Contacted" | "Resolved") => {
    try {
      await updateCallbackRequestStatus(userPhone, id, status);
      await load();
    } catch {
      // no-op
    }
  };

  const updateLoanStatus = async (id: string, status: "In Review" | "Approved" | "Rejected" | "Disbursed") => {
    try {
      await updateLoanStatusForAdmin(userPhone, id, status);
      await load();
    } catch {
      // no-op
    }
  };

  const openLoanDocument = async (loanId: string, documentKey: string) => {
    try {
      const res = await getAdminLoanDocumentUrl(userPhone, loanId, documentKey);
      const downloadUrl = res.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Document link was not returned");
      }

      await Linking.openURL(downloadUrl);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Unable to open document");
    }
  };

  const openLoanDetails = (loanId: string) => {
    router.push({ pathname: "/admin-application/[id]", params: { id: loanId } });
  };

  const openNotificationComposer = (loan: LoanItem) => {
    setNotificationLoan(loan);
    setNotificationTitle(`Update for ${loan.applicationNumber || "your application"}`);
    setNotificationBody(`Hello ${loan.name || "there"}, your application is being reviewed.`);
  };

  const closeNotificationComposer = () => {
    if (sendingNotification) return;
    setNotificationLoan(null);
    setNotificationTitle("");
    setNotificationBody("");
  };

  const sendNotification = async () => {
    if (!notificationLoan?.userId) {
      alert("This application is missing a user ID.");
      return;
    }

    if (!String(notificationTitle || "").trim()) {
      alert("Please enter a notification title.");
      return;
    }

    if (!String(notificationBody || "").trim()) {
      alert("Please enter a notification message.");
      return;
    }

    try {
      setSendingNotification(true);
      await sendAdminNotificationToUser(userPhone, notificationLoan.userId, {
        title: notificationTitle.trim(),
        body: notificationBody.trim(),
        data: {
          type: "admin-message",
          loanId: notificationLoan._id,
          applicationNumber: notificationLoan.applicationNumber,
        },
      });
      closeNotificationComposer();
      alert("Notification sent.");
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Unable to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const summary = useMemo(
    () => ({
      callbacks: callbacks.length,
      pendingCallbacks: callbacks.filter((item) => item.status === "Pending").length,
      loans: loans.length,
      pendingLoans: loans.filter((item) => !item.status || item.status === "In Review").length,
    }),
    [callbacks, loans]
  );

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityLabel="Go back"
            activeOpacity={0.86}
            style={headerIconButton}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <MaterialIcons name="lock" size={42} color={theme.warning} />
          <Text style={{ marginTop: 12, color: theme.ink, fontSize: 18, fontWeight: "900", textAlign: "center" }}>Unauthorized Access</Text>
          <Text style={{ marginTop: 8, color: theme.body, fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 19 }}>
            This admin portal is only available for the configured admin mobile number.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityLabel="Go back"
            activeOpacity={0.86}
            style={headerIconButton}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.ink, fontSize: 22, fontWeight: "900" }}>Admin Portal</Text>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600" }}>Callbacks + Loan applications</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.86}
            accessibilityLabel="Logout"
            style={logoutButton}
          >
            <MaterialIcons name="logout" size={18} color="#DC2626" />
            <Text style={logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <View style={summaryCard}>
            <Text style={summaryValue}>{summary.callbacks}</Text>
            <Text style={summaryLabel}>Callbacks</Text>
          </View>
          <View style={summaryCard}>
            <Text style={summaryValue}>{summary.pendingCallbacks}</Text>
            <Text style={summaryLabel}>Callback Pending</Text>
          </View>
          <View style={summaryCard}>
            <Text style={summaryValue}>{summary.pendingLoans}</Text>
            <Text style={summaryLabel}>Loan In Review</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {[
            { key: "callbacks", label: "Callback Requests" },
            { key: "loans", label: "Loan Applications" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as "callbacks" | "loans")}
              activeOpacity={0.86}
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: activeTab === tab.key ? theme.primary : theme.border,
                backgroundColor: activeTab === tab.key ? "#EAF1FF" : theme.white,
              }}
            >
              <Text style={{ color: activeTab === tab.key ? theme.primary : theme.body, fontSize: 12, fontWeight: "800" }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />}
        {!loading && !!error && <Text style={{ color: theme.warning, fontSize: 12, fontWeight: "700" }}>{error}</Text>}

        {!loading && !error && activeTab === "callbacks" && callbacks.map((item) => {
          const statusColor = item.status === "Resolved" ? theme.success : item.status === "Contacted" ? theme.primary : theme.warning;
          return (
            <View key={item._id} style={itemCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "900" }}>{item.name || "Student"}</Text>
                <View style={{ backgroundColor: `${statusColor}22`, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 }}>
                  <Text style={{ color: statusColor, fontSize: 11, fontWeight: "900" }}>{item.status}</Text>
                </View>
              </View>
              <Text style={metaText}>Phone: {item.phone}</Text>
              {!!item.email && <Text style={metaText}>Email: {item.email}</Text>}
              {!!item.preferredTime && <Text style={metaText}>Preferred: {item.preferredTime}</Text>}
              {!!item.message && <Text style={{ ...metaText, marginTop: 6 }}>{item.message}</Text>}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                {(["Pending", "Contacted", "Resolved"] as const).map((status) => (
                  <TouchableOpacity key={status} onPress={() => updateCallbackStatus(item._id, status)} activeOpacity={0.86} style={statusBtn(item.status === status)}>
                    <Text style={statusText(item.status === status)}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {!loading && !error && activeTab === "loans" && loans.map((item) => {
          const status = item.status || "In Review";
          const statusColor = status === "Approved" || status === "Disbursed" ? theme.success : status === "Rejected" ? theme.warning : theme.primary;
          const documentEntries = Object.entries(item.documents || {}).filter(([, document]) => Boolean(document?.key));

          return (
            <View key={item._id} style={itemCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: theme.primary, fontSize: 11, fontWeight: "900" }}>
                    {item.applicationNumber || "Application number pending"}
                  </Text>
                  <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "900", marginTop: 3 }}>{item.name || "Student"}</Text>
                </View>
                <View style={{ backgroundColor: `${statusColor}22`, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 }}>
                  <Text style={{ color: statusColor, fontSize: 11, fontWeight: "900" }}>{status}</Text>
                </View>
              </View>
              <Text style={metaText}>Phone: {item.phone || "N/A"}</Text>
              <Text style={metaText}>Course: {item.course || "N/A"}</Text>
              <Text style={metaText}>Loan Amount: Rs. {item.loanAmount || "N/A"}</Text>
              <TouchableOpacity onPress={() => openLoanDetails(item._id)} activeOpacity={0.86} style={detailsBtn}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}>View application details</Text>
                <MaterialIcons name="chevron-right" size={18} color={theme.primary} />
              </TouchableOpacity>

              {documentEntries.length > 0 && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {documentEntries.map(([documentKey, document]) => (
                    <TouchableOpacity
                      key={documentKey}
                      onPress={() => openLoanDocument(item._id, documentKey)}
                      activeOpacity={0.86}
                      style={documentBtn}
                    >
                      <MaterialIcons name="visibility" size={15} color={theme.primary} />
                      <Text style={documentText}>{documentLabels[documentKey] || document.originalName || document.name || "Document"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <TouchableOpacity
                  onPress={() => openNotificationComposer(item)}
                  activeOpacity={0.86}
                  style={notifyBtn}
                >
                  <MaterialIcons name="notifications-active" size={16} color={theme.primary} />
                  <Text style={notifyText}>Send Notification</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {(["In Review", "Approved", "Rejected", "Disbursed"] as const).map((nextStatus) => (
                  <TouchableOpacity
                    key={nextStatus}
                    onPress={() => updateLoanStatus(item._id, nextStatus)}
                    activeOpacity={0.86}
                    style={statusBtn(status === nextStatus)}
                  >
                    <Text style={statusText(status === nextStatus)}>{nextStatus}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!notificationLoan} transparent animationType="fade" onRequestClose={closeNotificationComposer}>
        <View style={modalBackdrop}>
          <View style={modalCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: theme.ink, fontSize: 17, fontWeight: "900" }}>Send Notification</Text>
                <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                  {notificationLoan?.applicationNumber || notificationLoan?.name || "Application"}
                </Text>
              </View>
              <TouchableOpacity onPress={closeNotificationComposer} activeOpacity={0.86} style={headerIconButton}>
                <MaterialIcons name="close" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <Text style={inputLabel}>Title</Text>
            <TextInput
              value={notificationTitle}
              onChangeText={setNotificationTitle}
              placeholder="Enter notification title"
              placeholderTextColor="#94A3B8"
              style={textInput}
            />

            <Text style={inputLabel}>Message</Text>
            <TextInput
              value={notificationBody}
              onChangeText={setNotificationBody}
              placeholder="Enter notification message"
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={[textInput, { minHeight: 110, paddingTop: 12 }]}
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <TouchableOpacity onPress={closeNotificationComposer} activeOpacity={0.86} style={secondaryActionBtn}>
                <Text style={secondaryActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendNotification} activeOpacity={0.86} style={primaryActionBtn}>
                <Text style={primaryActionText}>{sendingNotification ? "Sending..." : "Send"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const headerIconButton = {
  width: 38,
  height: 38,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.border,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: theme.white,
};

const logoutButton = {
  height: 38,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#FCA5A5",
  backgroundColor: theme.white,
  paddingHorizontal: 10,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 6,
};

const logoutText = {
  color: "#DC2626",
  fontSize: 12,
  fontWeight: "900" as const,
};

const summaryCard = {
  flex: 1,
  backgroundColor: theme.white,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.border,
  paddingVertical: 10,
  alignItems: "center" as const,
};

const summaryValue = {
  color: theme.ink,
  fontSize: 18,
  fontWeight: "900" as const,
};

const summaryLabel = {
  color: theme.body,
  fontSize: 10,
  fontWeight: "700" as const,
  marginTop: 2,
  textAlign: "center" as const,
};

const itemCard = {
  backgroundColor: theme.white,
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 12,
  padding: 14,
  marginBottom: 10,
};

const metaText = {
  color: theme.body,
  fontSize: 12,
  fontWeight: "600" as const,
  marginTop: 2,
};

const statusBtn = (active: boolean) => ({
  borderRadius: 8,
  borderWidth: 1,
  borderColor: active ? theme.primary : theme.border,
  backgroundColor: active ? "#EAF1FF" : theme.white,
  paddingHorizontal: 10,
  paddingVertical: 6,
});

const documentBtn = {
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: "#F7FAFF",
  paddingHorizontal: 10,
  paddingVertical: 6,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 5,
};

const detailsBtn = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  alignSelf: "flex-start" as const,
  marginTop: 10,
};

const notifyBtn = {
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#BFD4F5",
  backgroundColor: "#F4F8FF",
  paddingHorizontal: 10,
  paddingVertical: 7,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 6,
};

const notifyText = {
  color: theme.primary,
  fontSize: 12,
  fontWeight: "900" as const,
};

const documentText = {
  color: theme.primary,
  fontSize: 11,
  fontWeight: "800" as const,
};

const statusText = (active: boolean) => ({
  color: active ? theme.primary : theme.body,
  fontSize: 11,
  fontWeight: "800" as const,
});

const modalBackdrop = {
  flex: 1,
  backgroundColor: "rgba(15,33,63,0.35)",
  justifyContent: "center" as const,
  padding: 18,
};

const modalCard = {
  backgroundColor: theme.white,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 16,
};

const inputLabel = {
  color: theme.ink,
  fontSize: 12,
  fontWeight: "800" as const,
  marginBottom: 6,
  marginTop: 4,
};

const textInput = {
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 10,
  backgroundColor: "#F8FBFF",
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: theme.ink,
  fontSize: 14,
  fontWeight: "600" as const,
};

const primaryActionBtn = {
  flex: 1,
  borderRadius: 10,
  backgroundColor: theme.primary,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  minHeight: 42,
};

const primaryActionText = {
  color: theme.white,
  fontSize: 13,
  fontWeight: "900" as const,
};

const secondaryActionBtn = {
  flex: 1,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: theme.white,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  minHeight: 42,
};

const secondaryActionText = {
  color: theme.body,
  fontSize: 13,
  fontWeight: "800" as const,
};
