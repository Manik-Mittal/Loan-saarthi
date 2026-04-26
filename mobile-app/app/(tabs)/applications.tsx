import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../src/context/UserContext";
import { getLoansByUser } from "../../src/services/loanApi";

const blueTheme = {
  primary: "#003087",
  skyBlue: "#0066CC",
  paleBlue: "#E8F2FF",
  surface: "#FAFBFC",
  white: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#E5E7EB",
  warning: "#F59E0B",
  success: "#10B981",
};

const AnimatedView = Animated.createAnimatedComponent(View);

function getStatusColor(status: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "approved") {
    return blueTheme.success;
  }

  return blueTheme.warning;
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

function SummaryTile({ label, value, icon, color }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: blueTheme.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: blueTheme.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: blueTheme.paleBlue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
      <Text style={{ color: blueTheme.text, fontSize: 20, fontWeight: "800", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function ApplicationCard({ item }: any) {
  const status = item.status || "In Review";
  const statusColor = getStatusColor(status);

  return (
    <View
      style={{
        backgroundColor: blueTheme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: blueTheme.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: blueTheme.text, fontSize: 16, fontWeight: "800" }}>
            {item.course || "Education Loan"}
          </Text>
          <Text style={{ color: blueTheme.subText, fontSize: 13, marginTop: 4 }}>
            Rs. {item.loanAmount || "N/A"}
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
        <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "600" }}>
          Submitted on {formatDate(item.createdAt)}
        </Text>
        <Text style={{ color: blueTheme.primary, fontSize: 12, fontWeight: "800", marginTop: 6 }}>
          Duration: {item.duration || "N/A"} months
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ onStart }: any) {
  return (
    <View
      style={{
        backgroundColor: blueTheme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: blueTheme.border,
        padding: 20,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          backgroundColor: blueTheme.paleBlue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <MaterialIcons name="assignment" size={28} color={blueTheme.primary} />
      </View>
      <Text style={{ color: blueTheme.text, fontSize: 17, fontWeight: "800", textAlign: "center" }}>
        No applications yet
      </Text>
      <Text style={{ color: blueTheme.subText, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 }}>
        Start a loan application and it will appear here after you submit it.
      </Text>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onStart}
        style={{
          backgroundColor: blueTheme.primary,
          borderRadius: 10,
          paddingHorizontal: 18,
          paddingVertical: 12,
          marginTop: 16,
        }}
      >
        <Text style={{ color: blueTheme.white, fontSize: 14, fontWeight: "800" }}>
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
        backgroundColor: blueTheme.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: blueTheme.border,
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
          <MaterialIcons name="error-outline" size={22} color={blueTheme.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: blueTheme.text, fontSize: 15, fontWeight: "800" }}>
            Could not load applications
          </Text>
          <Text style={{ color: blueTheme.subText, fontSize: 13, lineHeight: 18, marginTop: 3 }}>
            {message}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onRetry}
        style={{
          alignSelf: "flex-start",
          backgroundColor: blueTheme.primary,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginTop: 14,
        }}
      >
        <Text style={{ color: blueTheme.white, fontSize: 13, fontWeight: "800" }}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ApplyTab() {
  const router = useRouter();
  const { user } = useUser();
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
      loadApplications();
    }, [loadApplications])
  );

  const startApplication = () => router.push("/apply");
  const approvedCount = applications.filter((item) => item.status === "Approved").length;
  const pendingCount = applications.length - approvedCount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: blueTheme.surface }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInDown.duration(500)} style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: blueTheme.text }}>
            Applications
          </Text>
          <Text style={{ color: blueTheme.subText, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
            Track your submitted loan requests and start a new application when you are ready.
          </Text>
        </AnimatedView>

        <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ marginBottom: 18 }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={startApplication}
            style={{
              backgroundColor: blueTheme.primary,
              borderRadius: 12,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: blueTheme.white, fontSize: 18, fontWeight: "800" }}>
                Start New Application
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                Fill personal, education, and financial details in four steps.
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.16)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="arrow-forward" size={24} color={blueTheme.white} />
            </View>
          </TouchableOpacity>
        </AnimatedView>

        {applications.length > 0 && (
          <AnimatedView entering={FadeInDown.duration(600).delay(180)} style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <SummaryTile label="Total" value={applications.length} icon="assignment" color={blueTheme.primary} />
            <SummaryTile label="Approved" value={approvedCount} icon="verified" color={blueTheme.success} />
            <SummaryTile label="Pending" value={pendingCount} icon="schedule" color={blueTheme.warning} />
          </AnimatedView>
        )}

        <AnimatedView entering={FadeInDown.duration(600).delay(260)}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: blueTheme.text, marginBottom: 12 }}>
            Recent Applications
          </Text>

          {loading && <ActivityIndicator size="large" color={blueTheme.skyBlue} style={{ marginTop: 20 }} />}

          {!loading && error && <ErrorState message={error} onRetry={loadApplications} />}

          {!loading && !error && applications.length === 0 && (
            <EmptyState onStart={startApplication} />
          )}

          {!loading && applications.map((item) => (
            <ApplicationCard key={item._id} item={item} />
          ))}
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
}
