import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext";
import { getLoansByUser } from "../../src/services/loanApi";

const appTheme = {
  primary: "#195BFF",
  iconAccent: "#17A589",
  skyBlue: "#195BFF",
  paleBlue: "#EAF2FF",
  surface: "#EEF3F9",
  white: "#FFFFFF",
  text: "#10223F",
  subText: "#60718B",
  border: "#D8E3F2",
  warning: "#D98A24",
  success: "#17A589",
};

const AnimatedView = Animated.createAnimatedComponent(View);

function getStatusColor(status: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "approved") {
    return appTheme.success;
  }

  return appTheme.warning;
}

function formatDate(date?: string) {
  if (!date) {
    return "Recently updated";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatApplicationNumber(value?: string) {
  return String(value || "").trim() || "Application number pending";
}

function SummaryTile({ label, value, icon, color }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: appTheme.white,
        borderRadius: 13,
        padding: 14,
        borderWidth: 1,
        borderColor: appTheme.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: appTheme.paleBlue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={{ color: appTheme.subText, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text style={{ color: appTheme.text, fontSize: 20, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function ApplicationCard({ item, onPress }: any) {
  const status = item.status || "In Review";
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: appTheme.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: appTheme.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: appTheme.iconAccent, fontSize: 11, fontWeight: "900", letterSpacing: 0.4 }}>
            {formatApplicationNumber(item.applicationNumber)}
          </Text>
          <Text style={{ color: appTheme.text, fontSize: 16, fontWeight: "900" }}>
            {item.course || "Education Loan"}
          </Text>
          <Text style={{ color: appTheme.subText, fontSize: 13, marginTop: 4 }}>
            {"\u20B9"}{item.loanAmount || "N/A"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${statusColor}18`,
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: statusColor, fontSize: 12, fontWeight: "800" }}>
            {status}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: appTheme.subText, fontSize: 12, fontWeight: "700" }}>
          Submitted on {formatDate(item.createdAt)}
        </Text>
        <Text style={{ color: appTheme.iconAccent, fontSize: 12, fontWeight: "800", marginTop: 6 }}>
          Duration: {item.duration || "N/A"} months
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
          <Text style={{ color: appTheme.primary, fontSize: 12, fontWeight: "900" }}>
            View submitted details
          </Text>
          <MaterialIcons name="chevron-right" size={18} color={appTheme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onStart }: any) {
  return (
    <View
      style={{
        backgroundColor: appTheme.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: appTheme.border,
        padding: 20,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          backgroundColor: appTheme.paleBlue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <MaterialIcons name="assignment" size={28} color={appTheme.iconAccent} />
      </View>
      <Text style={{ color: appTheme.text, fontSize: 17, fontWeight: "900", textAlign: "center" }}>
        No applications yet
      </Text>
      <Text style={{ color: appTheme.subText, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 }}>
        Start a loan application and it will appear here after you submit it.
      </Text>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onStart}
        style={{
          backgroundColor: appTheme.primary,
          borderRadius: 10,
          paddingHorizontal: 18,
          paddingVertical: 12,
          marginTop: 16,
        }}
      >
        <Text style={{ color: appTheme.white, fontSize: 14, fontWeight: "800" }}>
          Start Application
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ErrorState({ message, onRetry }: any) {
  return (
    <View
      style={{
        backgroundColor: appTheme.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: appTheme.border,
        padding: 18,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: "#FEF3C7",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="error-outline" size={22} color={appTheme.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: appTheme.text, fontSize: 15, fontWeight: "900" }}>
            Could not load applications
          </Text>
          <Text style={{ color: appTheme.subText, fontSize: 13, lineHeight: 18, marginTop: 3 }}>
            {message}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onRetry}
        style={{
          alignSelf: "flex-start",
          backgroundColor: appTheme.primary,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginTop: 14,
        }}
      >
        <Text style={{ color: appTheme.white, fontSize: 13, fontWeight: "800" }}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ApplyTab() {
  const router = useRouter();
  const { user } = useUser();
  const scrollRef = useRef<ScrollView | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    if (!user?._id) {
      setApplications([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getLoansByUser(user._id);
      setApplications(res.data?.loans || res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      loadApplications();
    }, [loadApplications])
  );

  const startApplication = () => router.push("/apply");
  const openApplication = (id: string) => router.push({ pathname: "/application/[id]", params: { id } });
  const approvedCount = applications.filter((item) => String(item.status || "").toLowerCase() === "approved").length;
  const pendingCount = applications.length - approvedCount;

  return (
    <View style={{ flex: 1, backgroundColor: appTheme.surface }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 124 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: "#DCE9FF", paddingTop: 20, paddingBottom: 78, paddingHorizontal: 16, overflow: "hidden" }}>
          <View style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "#C8DCFF", top: -100, right: -40 }} />
          <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#EAF2FF", bottom: -70, left: -50 }} />

          <AnimatedView entering={FadeInDown.duration(520)} style={{ marginBottom: 2 }}>
            <Text style={{ color: appTheme.subText, fontSize: 12, fontWeight: "800" }}>TRACKER</Text>
            <Text style={{ fontSize: 30, fontWeight: "900", color: appTheme.text, marginTop: 2 }}>
              Applications
            </Text>
            <Text style={{ color: appTheme.subText, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              Track submitted loan requests and start a new one when needed.
            </Text>
          </AnimatedView>
        </View>

        <AnimatedView entering={ZoomIn.duration(580).delay(100)} style={{ marginTop: -56, paddingHorizontal: 16, marginBottom: 18 }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={startApplication}
            style={{
              backgroundColor: "#10264A",
              borderRadius: 18,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#0A1C36",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: appTheme.white, fontSize: 19, fontWeight: "900" }}>
                Start New Application
              </Text>
              <Text style={{ color: "#D4E0F5", fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                Fill personal, education, and financial details in four steps.
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: "#15325C",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="arrow-forward" size={24} color={appTheme.white} />
            </View>
          </TouchableOpacity>
        </AnimatedView>

        {applications.length > 0 && (
          <AnimatedView entering={FadeInDown.duration(560).delay(160)} style={{ flexDirection: "row", gap: 10, marginBottom: 20, paddingHorizontal: 16 }}>
            <SummaryTile label="Total" value={applications.length} icon="assignment" color={appTheme.iconAccent} />
            <SummaryTile label="Approved" value={approvedCount} icon="verified" color={appTheme.success} />
            <SummaryTile label="Pending" value={pendingCount} icon="schedule" color={appTheme.warning} />
          </AnimatedView>
        )}

        <AnimatedView entering={FadeInDown.duration(560).delay(220)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: appTheme.text, marginBottom: 12 }}>
            Recent Applications
          </Text>

          {loading && <ActivityIndicator size="large" color={appTheme.skyBlue} style={{ marginTop: 20 }} />}

          {!loading && error && <ErrorState message={error} onRetry={loadApplications} />}

          {!loading && !error && applications.length === 0 && (
            <EmptyState onStart={startApplication} />
          )}

          {!loading && applications.map((item) => (
            <ApplicationCard key={item._id} item={item} onPress={() => openApplication(item._id)} />
          ))}
        </AnimatedView>
      </ScrollView>
    </View>
  );
}
