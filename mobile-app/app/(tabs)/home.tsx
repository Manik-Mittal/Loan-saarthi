import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext";
import { getLoansByUser } from "../../src/services/loanApi";

const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

const theme = {
  background: "#EEF3F9",
  paper: "#FFFFFF",
  ink: "#10223F",
  muted: "#60718B",
  primary: "#195BFF",
  cyan: "#12A4D9",
  teal: "#17A589",
  iconAccent: "#17A589",
  amber: "#D98A24",
  border: "#D8E3F2",
  softBlue: "#EAF2FF",
};

const AnimatedView = Animated.createAnimatedComponent(View);

type LoanApp = {
  _id: string;
  course?: string;
  loanAmount?: string | number;
  status?: string;
  createdAt?: string;
};

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
      <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900" }}>{title}</Text>
      {!!action && (
        <TouchableOpacity activeOpacity={0.85} onPress={onAction}>
          <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tint,
}: {
  label: string;
  value: string;
  helper: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tint: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.paper,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 13,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: tint, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <MaterialIcons name={icon} size={18} color={theme.paper} />
      </View>
      <Text style={{ color: theme.muted, fontSize: 10, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.ink, fontSize: 21, fontWeight: "900", marginTop: 4 }}>{value}</Text>
      <Text style={{ color: theme.teal, fontSize: 10, fontWeight: "800", marginTop: 4 }}>{helper}</Text>
    </View>
  );
}

function formatCurrency(value?: string | number) {
  if (value === null || value === undefined || value === "") return "Not set";
  const num = Number(String(value).replace(/[^\d.]/g, ""));
  if (Number.isNaN(num) || num <= 0) return String(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const scrollRef = useRef<ScrollView | null>(null);
  const [applications, setApplications] = useState<LoanApp[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  const currentPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);
  const isAdmin = Boolean(ADMIN_PHONE) && currentPhone === ADMIN_PHONE;

  const firstName = useMemo(() => {
    if (user?.name) return String(user.name).split(" ")[0];
    if (user?.phone) return `+91 ${String(user.phone).slice(-10)}`;
    return "Student";
  }, [user]);

  const profileFields = [
    user?.name,
    user?.phone,
    user?.email,
    user?.education?.college,
    user?.education?.course,
    user?.financial?.income,
    user?.financial?.loanAmount,
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const documents = user?.documents || {};
  const requiredDocs = useMemo(
    () => [
      { key: "aadhaar", label: "Aadhaar" },
      { key: "pan", label: "PAN" },
      { key: "marksheet12", label: "12th Marksheet" },
      { key: "admissionLetter", label: "Admission Letter" },
    ],
    []
  );
  const uploadedDocs = requiredDocs.filter((d) => Boolean(documents?.[d.key])).length;
  const docsCompletion = Math.round((uploadedDocs / requiredDocs.length) * 100);

  const appStats = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter((a) => !a.status || a.status.toLowerCase() === "in review").length;
    const approved = applications.filter((a) => a.status?.toLowerCase() === "approved").length;
    return { total, inReview, approved };
  }, [applications]);
  const readinessScore = useMemo(() => {
    const applicationSignal = appStats.total > 0 ? 100 : 0;
    return Math.round((profileCompletion * 0.5) + (docsCompletion * 0.3) + (applicationSignal * 0.2));
  }, [appStats.total, docsCompletion, profileCompletion]);

  const loadApplications = useCallback(async () => {
    if (!user?._id) {
      setApplications([]);
      setApplicationsError("");
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError("");
      const res = await getLoansByUser(user._id);
      setApplications(res.data?.loans || res.data || []);
    } catch (err: any) {
      setApplicationsError(err?.response?.data?.error || err?.message || "Unable to load applications");
    } finally {
      setApplicationsLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      loadApplications();
    }, [loadApplications])
  );

  const nextActions = useMemo(
    () => [
      {
        title: "Complete profile",
        done: profileCompletion >= 100,
        onPress: () => router.push("/(tabs)/profile"),
      },
      {
        title: "Upload required documents",
        done: uploadedDocs === requiredDocs.length,
        onPress: () => router.push("/(tabs)/profile"),
      },
      {
        title: "Submit loan application",
        done: appStats.total > 0,
        onPress: () => router.push("/apply"),
      },
    ],
    [appStats.total, profileCompletion, requiredDocs.length, router, uploadedDocs]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: "#DCE9FF", paddingTop: 20, paddingBottom: 78, paddingHorizontal: 16, overflow: "hidden" }}>
          <View style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "#C8DCFF", top: -100, right: -40 }} />
          <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#EAF2FF", bottom: -70, left: -50 }} />

          <AnimatedView entering={FadeInDown.duration(530)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: theme.muted, fontSize: 11, fontWeight: "800" }}>WELCOME BACK</Text>
              <Text style={{ color: theme.ink, fontSize: 30, fontWeight: "900", marginTop: 1 }} numberOfLines={1}>
                {firstName}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                Track progress, complete tasks, and move toward faster approval.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: theme.paper,
                borderWidth: 1,
                borderColor: "#C7D9F5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="account-circle" size={24} color={theme.iconAccent} />
            </TouchableOpacity>
          </AnimatedView>
        </View>

        <AnimatedView entering={ZoomIn.duration(560).delay(90)} style={{ marginTop: -56, paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              borderRadius: 18,
              backgroundColor: "#10264A",
              padding: 18,
              shadowColor: "#0A1C36",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <Text style={{ color: "#9CB7E4", fontSize: 11, fontWeight: "800" }}>APPLICATION READINESS</Text>
            <Text style={{ color: theme.paper, fontSize: 36, fontWeight: "900", lineHeight: 40, marginTop: 5 }}>
              {`${readinessScore}%`}
            </Text>
            <Text style={{ color: "#D4E0F5", fontSize: 12, fontWeight: "700", marginTop: 6 }}>
              Computed from profile completion, documents, and application activity.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/apply")}
              activeOpacity={0.9}
              style={{ backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 14 }}
            >
              <Text style={{ color: theme.paper, fontSize: 13, fontWeight: "900" }}>
                {appStats.total > 0 ? "IMPROVE READINESS" : "START APPLICATION"}
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={theme.paper} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(540).delay(130)} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <MetricCard label="PROFILE" value={`${profileCompletion}%`} helper="Completion" icon="person" tint={theme.primary} />
            <MetricCard label="TASKS" value={`${nextActions.filter((item) => item.done).length}/${nextActions.length}`} helper="Completed" icon="task-alt" tint={theme.teal} />
            <MetricCard label="APPLICATIONS" value={`${appStats.total}`} helper="Submitted" icon="description" tint={theme.cyan} />
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(540).delay(180)} style={{ paddingHorizontal: 16, marginBottom: 18 }}>
          <SectionTitle title="Application Pipeline" action="View all" onAction={() => router.push("/(tabs)/applications")} />
          <View style={{ backgroundColor: theme.paper, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 }}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <View style={miniStat}>
                <Text style={miniStatValue}>{appStats.total}</Text>
                <Text style={miniStatLabel}>Total</Text>
              </View>
              <View style={miniStat}>
                <Text style={miniStatValue}>{appStats.inReview}</Text>
                <Text style={miniStatLabel}>In Review</Text>
              </View>
              <View style={miniStat}>
                <Text style={miniStatValue}>{appStats.approved}</Text>
                <Text style={miniStatLabel}>Approved</Text>
              </View>
            </View>

            {applicationsLoading && <Text style={{ color: theme.muted, fontSize: 12, fontWeight: "700" }}>Loading applications...</Text>}
            {!applicationsLoading && !!applicationsError && (
              <TouchableOpacity onPress={loadApplications} activeOpacity={0.86}>
                <Text style={{ color: theme.amber, fontSize: 12, fontWeight: "700" }}>{applicationsError}</Text>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800", marginTop: 3 }}>Tap to retry</Text>
              </TouchableOpacity>
            )}

            {!applicationsLoading &&
              !applicationsError &&
              applications.slice(0, 2).map((app) => {
                const status = app.status || "In Review";
                const statusColor = status.toLowerCase() === "approved" ? theme.teal : theme.amber;
                return (
                  <View key={app._id} style={recentRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.ink, fontSize: 13, fontWeight: "800" }}>{app.course || "Education Loan"}</Text>
                      <Text style={{ color: theme.muted, fontSize: 12, fontWeight: "600", marginTop: 2 }}>{formatCurrency(app.loanAmount)}</Text>
                    </View>
                    <View style={{ borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: `${statusColor}18` }}>
                      <Text style={{ color: statusColor, fontSize: 11, fontWeight: "900" }}>{status}</Text>
                    </View>
                  </View>
                );
              })}
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(540).delay(230)} style={{ paddingHorizontal: 16, marginBottom: 18 }}>
          <SectionTitle title="Next Best Actions" />
          <View style={{ backgroundColor: theme.paper, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 }}>
            {nextActions.map((item) => (
              <TouchableOpacity key={item.title} onPress={item.onPress} activeOpacity={0.86} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                <MaterialIcons name={item.done ? "check-circle" : "radio-button-unchecked"} size={19} color={item.done ? theme.teal : theme.muted} />
                <Text style={{ marginLeft: 8, color: theme.ink, fontSize: 13, fontWeight: "700", flex: 1 }}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={18} color={theme.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(540).delay(280)} style={{ paddingHorizontal: 16 }}>
          <SectionTitle title="Help & Guidance" />
          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            {[
              { title: "Request Callback", sub: "Talk to advisor", icon: "support-agent", bg: theme.softBlue, onPress: () => router.push("/request-callback") },
              { title: "Education Loan FAQ", sub: "Important answers", icon: "help-outline", bg: "#E8F8F5", onPress: () => router.push("/faq") },
              ...(isAdmin ? [{ title: "Admin Portal", sub: "Manage requests", icon: "admin-panel-settings", bg: "#FFF3E8", onPress: () => router.push("/admin-callbacks") }] : []),
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.86}
                onPress={item.onPress}
                style={{
                  width: isAdmin ? "48.3%" : "48.5%",
                  backgroundColor: theme.paper,
                  borderRadius: 12,
                  padding: 13,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: item.bg, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={theme.iconAccent} />
                </View>
                <Text style={{ color: theme.ink, fontSize: 12, fontWeight: "900" }}>{item.title}</Text>
                <Text style={{ color: theme.muted, fontSize: 10, fontWeight: "700", marginTop: 3 }}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const miniStat = {
  flex: 1,
  backgroundColor: "#F7FAFF",
  borderWidth: 1,
  borderColor: "#E1EAF7",
  borderRadius: 10,
  paddingVertical: 9,
  alignItems: "center" as const,
};

const miniStatValue = {
  color: theme.ink,
  fontSize: 18,
  fontWeight: "900" as const,
};

const miniStatLabel = {
  color: theme.muted,
  fontSize: 10,
  fontWeight: "700" as const,
  marginTop: 2,
};

const recentRow = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingVertical: 10,
  borderTopWidth: 1,
  borderTopColor: "#EEF2F9",
};
