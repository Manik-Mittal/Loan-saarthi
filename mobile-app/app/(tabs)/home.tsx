import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext";
import { getLoansByUser } from "../../src/services/loanApi";

const theme = {
  background: "#F4F7FB",
  white: "#FFFFFF",
  ink: "#0F213F",
  body: "#5D6D87",
  primary: "#1555D6",
  accent: "#159A88",
  warm: "#E18C2B",
  border: "#DCE7F4",
  pale: "#ECF3FE",
};

const AnimatedView = Animated.createAnimatedComponent(View);
const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

type LoanApp = {
  _id: string;
  course?: string;
  loanAmount?: string | number;
  status?: string;
};

function QuickStat({
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
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: tint,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <MaterialIcons name={icon} size={18} color={theme.white} />
      </View>
      <Text style={{ color: theme.body, fontSize: 11, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.ink, fontSize: 22, fontWeight: "900", marginTop: 4 }}>{value}</Text>
      <Text style={{ color: theme.accent, fontSize: 11, fontWeight: "800", marginTop: 5 }}>{helper}</Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const currentPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);
  const isAdmin = Boolean(ADMIN_PHONE) && currentPhone === ADMIN_PHONE;
  const scrollRef = useRef<ScrollView | null>(null);
  const [applications, setApplications] = useState<LoanApp[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  const firstName = useMemo(() => {
    if (user?.name) return String(user.name).split(" ")[0];
    if (user?.phone) return `+91 ${String(user.phone).slice(-10)}`;
    return "Student";
  }, [user]);

  const profileFields = [user?.name, user?.phone, user?.email, user?.education?.course, user?.financial?.loanAmount];
  const completion = Math.max(40, Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100));
  const recentApplications = applications.slice(0, 3);

  const documentChecklist = useMemo(() => {
    const docs = user?.documents || {};

    return [
      { key: "aadhaar", label: "Aadhaar", uploaded: Boolean(docs.aadhaar) },
      { key: "pan", label: "PAN", uploaded: Boolean(docs.pan) },
      { key: "marksheet12", label: "12th Marksheet", uploaded: Boolean(docs.marksheet12) },
      { key: "admissionLetter", label: "Admission Letter", uploaded: Boolean(docs.admissionLetter) },
    ];
  }, [user?.documents]);

  const uploadedDocCount = documentChecklist.filter((item) => item.uploaded).length;

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 116 }}>
        <View style={{ backgroundColor: "#E9F1FF", paddingTop: 20, paddingBottom: 74, paddingHorizontal: 16, overflow: "hidden" }}>
          <View style={{ position: "absolute", width: 240, height: 240, borderRadius: 120, backgroundColor: "#D7E6FF", top: -100, right: -40 }} />
          <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#F1F6FF", bottom: -80, left: -60 }} />

          <AnimatedView entering={FadeInDown.duration(550)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: theme.body, fontSize: 11, fontWeight: "800" }}>WELCOME BACK</Text>
              <Text numberOfLines={1} style={{ color: theme.ink, fontSize: 28, fontWeight: "900", marginTop: 2 }}>
                {firstName}
              </Text>
              <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                Let us move your study plans ahead.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#CEE0FA",
                backgroundColor: theme.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="account-circle" size={25} color={theme.primary} />
            </TouchableOpacity>
          </AnimatedView>
        </View>

        <AnimatedView entering={ZoomIn.duration(580).delay(80)} style={{ marginTop: -54, paddingHorizontal: 16, marginBottom: 18 }}>
          <View
            style={{
              backgroundColor: theme.ink,
              borderRadius: 18,
              padding: 18,
              shadowColor: "#0D1F42",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.18,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <Text style={{ color: "#AFC3E6", fontSize: 11, fontWeight: "800" }}>ELIGIBILITY SNAPSHOT</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ color: theme.white, fontSize: 40, fontWeight: "900", lineHeight: 44 }}>₹50L</Text>
              <View style={{ backgroundColor: "#1C6E5B", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: "#E6FFF8", fontSize: 11, fontWeight: "900" }}>Pre-qualified</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 16 }}>
              <View style={{ flex: 1, borderRadius: 10, backgroundColor: "#173262", padding: 11 }}>
                <Text style={{ color: "#9CB8E8", fontSize: 10, fontWeight: "800" }}>RATES FROM</Text>
                <Text style={{ color: theme.white, fontSize: 16, fontWeight: "900", marginTop: 3 }}>8.5% p.a.</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 10, backgroundColor: "#173262", padding: 11 }}>
                <Text style={{ color: "#9CB8E8", fontSize: 10, fontWeight: "800" }}>TURNAROUND</Text>
                <Text style={{ color: theme.white, fontSize: 16, fontWeight: "900", marginTop: 3 }}>24 hours</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/apply")}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Text style={{ color: theme.white, fontSize: 14, fontWeight: "900" }}>START APPLICATION</Text>
              <MaterialIcons name="arrow-forward" size={18} color={theme.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(560).delay(120)} style={{ paddingHorizontal: 16, marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <QuickStat label="CREDIT SCORE" value="750" helper="Strong profile" icon="verified" tint={theme.primary} />
            <QuickStat label="MAX OFFER" value="₹50L" helper="Unlock ready" icon="account-balance" tint={theme.accent} />
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(560).delay(180)} style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <Text style={{ color: theme.ink, fontSize: 15, fontWeight: "900" }}>Profile Readiness</Text>
              <Text style={{ color: completion >= 80 ? theme.accent : theme.warm, fontSize: 15, fontWeight: "900" }}>{completion}%</Text>
            </View>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginBottom: 10 }}>Complete profile fields to improve lender matches.</Text>
            <View style={{ height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#EDF2F9" }}>
              <View
                style={{
                  width: `${completion}%`,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: completion >= 80 ? theme.accent : theme.primary,
                }}
              />
            </View>
            <TouchableOpacity activeOpacity={0.86} onPress={() => router.push("/(tabs)/profile")} style={{ marginTop: 10, alignSelf: "flex-start" }}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}>Complete Profile</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(560).delay(240)} style={{ paddingHorizontal: 16, marginBottom: 22 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900" }}>Applications</Text>
            {applications.length > 0 && (
              <TouchableOpacity activeOpacity={0.86} onPress={() => router.push("/(tabs)/applications")}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ gap: 10 }}>
            {applicationsLoading && (
              <View style={stateCard}>
                <Text style={{ color: theme.body, fontSize: 13, fontWeight: "700" }}>Loading your applications...</Text>
              </View>
            )}

            {!applicationsLoading && !!applicationsError && (
              <TouchableOpacity activeOpacity={0.86} onPress={loadApplications} style={stateCard}>
                <MaterialIcons name="refresh" size={21} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "900" }}>Unable to fetch applications</Text>
                  <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginTop: 3 }}>{applicationsError}</Text>
                </View>
              </TouchableOpacity>
            )}

            {!applicationsLoading && !applicationsError && applications.length === 0 && (
              <View style={stateCard}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.pale, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name="assignment" size={21} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "900" }}>No applications yet</Text>
                  <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginTop: 4 }}>Submit your first request to start tracking status.</Text>
                </View>
                <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/apply")} style={{ backgroundColor: theme.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: theme.white, fontSize: 11, fontWeight: "900" }}>APPLY</Text>
                </TouchableOpacity>
              </View>
            )}

            {!applicationsLoading &&
              !applicationsError &&
              recentApplications.map((app) => {
                const status = app.status || "In Review";
                const approved = status.toLowerCase() === "approved";
                const statusColor = approved ? theme.accent : theme.warm;

                return (
                  <View key={app._id} style={appCard}>
                    <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: theme.pale, alignItems: "center", justifyContent: "center" }}>
                      <MaterialIcons name="description" size={20} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "900" }}>{app.course || "Education Loan"}</Text>
                      <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginTop: 4 }}>₹{app.loanAmount || "N/A"}</Text>
                    </View>
                    <View style={{ borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: `${statusColor}22` }}>
                      <Text style={{ color: statusColor, fontSize: 11, fontWeight: "900" }}>{status}</Text>
                    </View>
                  </View>
                );
              })}
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(560).delay(300)} style={{ paddingHorizontal: 16, marginBottom: 22 }}>
          <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Documents Checklist</Text>
          <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14 }}>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "700", marginBottom: 8 }}>
              Uploaded {uploadedDocCount} / {documentChecklist.length} required documents
            </Text>

            {documentChecklist.map((item) => (
              <View key={item.key} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 7 }}>
                <MaterialIcons name={item.uploaded ? "check-circle" : "radio-button-unchecked"} size={18} color={item.uploaded ? theme.accent : theme.body} />
                <Text style={{ marginLeft: 8, color: theme.ink, fontSize: 13, fontWeight: "700" }}>{item.label}</Text>
              </View>
            ))}

            <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/(tabs)/profile")} style={{ marginTop: 8, alignSelf: "flex-start" }}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}>Manage Documents</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(560).delay(360)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Help & Guidance</Text>
          <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14, marginBottom: 16 }}>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", marginBottom: 10 }}>
              Need personalized support? Request a call from our team or read important loan FAQs.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push("/request-callback")}
                style={{ flex: 1, backgroundColor: theme.primary, borderRadius: 10, paddingVertical: 11, alignItems: "center" }}
              >
                <Text style={{ color: theme.white, fontSize: 12, fontWeight: "900" }}>REQUEST CALLBACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push("/faq")}
                style={{ flex: 1, borderWidth: 1, borderColor: theme.primary, borderRadius: 10, paddingVertical: 11, alignItems: "center", backgroundColor: "#EEF4FF" }}
              >
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}>READ FAQ</Text>
              </TouchableOpacity>
            </View>
            {isAdmin && (
              <TouchableOpacity activeOpacity={0.84} onPress={() => router.push("/admin-callbacks")} style={{ alignSelf: "flex-start" }}>
                <Text style={{ color: theme.body, fontSize: 11, fontWeight: "700" }}>Open Admin Portal</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ color: theme.ink, fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Tips To Improve Approval</Text>
          <View style={{ backgroundColor: theme.white, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14 }}>
            {[
              "Complete all personal and education details accurately.",
              "Upload clear, valid documents before applying.",
              "Choose a realistic loan amount based on income profile.",
            ].map((tip) => (
              <View key={tip} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 9 }}>
                <MaterialIcons name="check" size={16} color={theme.primary} style={{ marginTop: 2 }} />
                <Text style={{ marginLeft: 8, color: theme.body, fontSize: 12, fontWeight: "600", lineHeight: 18, flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const stateCard = {
  backgroundColor: theme.white,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 14,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
};

const appCard = {
  backgroundColor: theme.white,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 14,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
};
