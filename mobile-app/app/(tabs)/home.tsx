import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext"; 
import { getLoansByUser } from "../../src/services/loanApi";

const { width } = Dimensions.get("window");
const CAROUSEL_ITEM_WIDTH = width - 32;

const fintechTheme = {
  primary: "#2F6FED",
  ink: "#172033",
  mint: "#18A999",
  amber: "#D9822B",
  surface: "#F7FAFD",
  white: "#FFFFFF",
  text: "#172033",
  subText: "#758195",
  border: "#E8EEF5",
  lightGray: "#F1F5FA",
  paleBlue: "#EDF5FF",
  softBlue: "#F1F7FF",
  cream: "#FFF8EF",
};

const AnimatedView = Animated.createAnimatedComponent(View);

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ color: fintechTheme.text, fontSize: 16, fontWeight: "900" }}>{title}</Text>
      {!!action && (
        <TouchableOpacity activeOpacity={0.82} onPress={onAction}>
          <Text style={{ color: fintechTheme.primary, fontSize: 12, fontWeight: "800" }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatCard({ label, value, helper, icon }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: fintechTheme.white,
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: fintechTheme.border,
        shadowColor: "#8AA4C2",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: fintechTheme.softBlue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <MaterialIcons name={icon} size={18} color={fintechTheme.primary} />
      </View>
      <Text style={{ color: fintechTheme.subText, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>{label}</Text>
      <Text style={{ color: fintechTheme.text, fontSize: 23, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: fintechTheme.mint, fontSize: 11, fontWeight: "800", marginTop: 5 }}>{helper}</Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [activePage, setActivePage] = useState(0);
  const [loanAmount, setLoanAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  const loanOptions = [
    { id: 1, bank: "SBI Education", rate: "8.5%", amount: "₹50L", color: "#5B8DEF" },
    { id: 2, bank: "HDFC Credila", rate: "9.0%", amount: "₹50L", color: "#7C8CF5" },
    { id: 3, bank: "ICICI Bank", rate: "8.9%", amount: "₹50L", color: "#37B8A8" },
  ];

  const firstName = useMemo(() => {
    if (user?.name) return String(user.name).split(" ")[0];
    if (user?.phone) return `+91 ${String(user.phone).slice(-10)}`;
    return "Student";
  }, [user]);

  const profileFields = [
    user?.name,
    user?.phone,
    user?.email,
    user?.education?.course,
    user?.financial?.loanAmount,
  ];
  const completion = Math.max(40, Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100));
  const recentApplications = applications.slice(0, 2);

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
      loadApplications();
    }, [loadApplications])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    setActivePage(Math.round(contentOffsetX / CAROUSEL_ITEM_WIDTH));
  };

  return (
    <View style={{ flex: 1, backgroundColor: fintechTheme.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: "#EAF4FF", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 74 }}>
          <AnimatedView entering={FadeInDown.duration(600)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "800" }}>GOOD EVENING</Text>
              <Text numberOfLines={1} style={{ color: fintechTheme.text, fontSize: 25, fontWeight: "900", marginTop: 4 }}>
                {firstName}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: fintechTheme.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#DDEBFA",
              }}
            >
              <MaterialIcons name="account-circle" size={24} color={fintechTheme.primary} />
            </TouchableOpacity>
          </AnimatedView>
        </View>

        <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ marginTop: -52, paddingHorizontal: 16, marginBottom: 18 }}>
          <View
            style={{
              backgroundColor: fintechTheme.white,
              borderRadius: 10,
              padding: 18,
              borderWidth: 1,
              borderColor: fintechTheme.border,
              shadowColor: "#8AA4C2",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 4,
            }}
          >
            <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>ESTIMATED ELIGIBILITY</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: fintechTheme.text, fontSize: 38, fontWeight: "900", lineHeight: 42 }}>₹25L</Text>
              <View style={{ backgroundColor: "#EAFBF7", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 }}>
                <Text style={{ color: fintechTheme.mint, fontSize: 12, fontWeight: "900" }}>Pre-qualified</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
              <View style={{ flex: 1, backgroundColor: fintechTheme.softBlue, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#DEECFF" }}>
                <Text style={{ color: fintechTheme.subText, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>RATE FROM</Text>
                <Text style={{ color: fintechTheme.text, fontSize: 16, fontWeight: "900" }}>8.5% p.a.</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: fintechTheme.cream, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#F8E5C7" }}>
                <Text style={{ color: fintechTheme.subText, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>DECISION</Text>
                <Text style={{ color: fintechTheme.text, fontSize: 16, fontWeight: "900" }}>24 hrs</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/apply")}
              style={{
                backgroundColor: fintechTheme.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <MaterialIcons name="arrow-forward" size={18} color={fintechTheme.white} />
              <Text style={{ color: fintechTheme.white, fontSize: 14, fontWeight: "900" }}>START APPLICATION</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(160)} style={{ paddingHorizontal: 16, marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard label="CREDIT SCORE" value="750" helper="Good range" icon="verified" />
            <StatCard label="MAX OFFER" value="₹50L" helper="Unlocked" icon="account-balance" />
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(220)} style={{ paddingHorizontal: 16, marginBottom: 22 }}>
          <View
            style={{
              backgroundColor: fintechTheme.white,
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: fintechTheme.border,
              shadowColor: "#8AA4C2",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.07,
              shadowRadius: 14,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <View>
                <Text style={{ color: fintechTheme.text, fontSize: 15, fontWeight: "900" }}>Profile readiness</Text>
                <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "600", marginTop: 3 }}>Complete details to improve offers</Text>
              </View>
              <Text style={{ color: completion >= 80 ? fintechTheme.mint : fintechTheme.amber, fontSize: 15, fontWeight: "900" }}>{completion}%</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: fintechTheme.lightGray, overflow: "hidden" }}>
              <View
                style={{
                  width: `${completion}%`,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: completion >= 80 ? fintechTheme.mint : fintechTheme.primary,
                }}
              />
            </View>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(280)} style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <SectionHeader title="Recommended Offers" action="Compare" />
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            snapToInterval={CAROUSEL_ITEM_WIDTH}
            decelerationRate="fast"
          >
            {loanOptions.map((loan) => (
              <View key={loan.id} style={{ width: CAROUSEL_ITEM_WIDTH, paddingHorizontal: 16 }}>
                <View
                  style={{
                    backgroundColor: loan.color,
                    borderRadius: 12,
                    padding: 18,
                    minHeight: 182,
                    shadowColor: loan.color,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.16,
                    shadowRadius: 18,
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <View>
                      <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "800" }}>LENDER</Text>
                      <Text style={{ color: fintechTheme.white, fontSize: 22, fontWeight: "900", marginTop: 5 }}>{loan.bank}</Text>
                    </View>
                    <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
                      <MaterialIcons name="account-balance" size={23} color={fintechTheme.white} />
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 11, fontWeight: "800", marginBottom: 5 }}>INTEREST</Text>
                      <Text style={{ color: fintechTheme.white, fontSize: 20, fontWeight: "900" }}>{loan.rate}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 11, fontWeight: "800", marginBottom: 5 }}>LIMIT</Text>
                      <Text style={{ color: fintechTheme.white, fontSize: 20, fontWeight: "900" }}>{loan.amount}</Text>
                    </View>
                  </View>

                  <TouchableOpacity activeOpacity={0.88} style={{ backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}>
                    <Text style={{ color: loan.color, fontSize: 13, fontWeight: "900" }}>VIEW DETAILS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {loanOptions.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activePage ? 24 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === activePage ? fintechTheme.primary : "#D0D5DD",
                }}
              />
            ))}
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(340)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <SectionHeader title="Applications" action={applications.length > 0 ? "View all" : undefined} onAction={() => router.push("/(tabs)/applications")} />
          <View style={{ gap: 10 }}>
            {applicationsLoading && (
              <View style={applicationStateCard}>
                <Text style={{ color: fintechTheme.subText, fontSize: 13, fontWeight: "800" }}>Loading your applications...</Text>
              </View>
            )}

            {!applicationsLoading && !!applicationsError && (
              <TouchableOpacity activeOpacity={0.86} onPress={loadApplications} style={applicationStateCard}>
                <MaterialIcons name="refresh" size={22} color={fintechTheme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: fintechTheme.text, fontSize: 14, fontWeight: "900" }}>Could not load applications</Text>
                  <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "600", marginTop: 3 }}>{applicationsError}</Text>
                </View>
              </TouchableOpacity>
            )}

            {!applicationsLoading && !applicationsError && applications.length === 0 && (
              <View style={emptyApplicationCard}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: fintechTheme.softBlue, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <MaterialIcons name="assignment" size={22} color={fintechTheme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: fintechTheme.text, fontSize: 14, fontWeight: "900" }}>No applications yet</Text>
                  <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "600", lineHeight: 17, marginTop: 4 }}>
                    Start your first loan request and track it here.
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.86} onPress={() => router.push("/apply")} style={{ backgroundColor: fintechTheme.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ color: fintechTheme.white, fontSize: 11, fontWeight: "900" }}>APPLY</Text>
                </TouchableOpacity>
              </View>
            )}

            {!applicationsLoading && !applicationsError && recentApplications.map((app) => {
              const status = app.status || "In Review";
              const statusColor = status.toLowerCase() === "approved" ? fintechTheme.mint : fintechTheme.amber;

              return (
                <View
                  key={app._id}
                  style={{
                    backgroundColor: fintechTheme.white,
                    borderRadius: 12,
                    padding: 15,
                    borderWidth: 1,
                    borderColor: fintechTheme.border,
                    shadowColor: "#8AA4C2",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 2,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: fintechTheme.softBlue, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <MaterialIcons name="description" size={20} color={fintechTheme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: fintechTheme.text, fontSize: 14, fontWeight: "900" }}>{app.course || "Education Loan"}</Text>
                    <Text style={{ color: fintechTheme.subText, fontSize: 12, fontWeight: "600", marginTop: 4 }}>₹{app.loanAmount || "N/A"}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: `${statusColor}14` }}>
                    <Text style={{ color: statusColor, fontSize: 11, fontWeight: "900" }}>{status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(400)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <SectionHeader title="EMI Calculator" />
          <View
            style={{
              backgroundColor: fintechTheme.white,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: fintechTheme.border,
              shadowColor: "#8AA4C2",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.07,
              shadowRadius: 14,
              elevation: 2,
            }}
          >
            <TextInput
              placeholder="Loan amount"
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={setLoanAmount}
              style={input}
              placeholderTextColor={fintechTheme.subText}
            />
            <TextInput
              placeholder="Duration in years"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
              style={input}
              placeholderTextColor={fintechTheme.subText}
            />
            <TouchableOpacity
              activeOpacity={0.88}
              style={{
                backgroundColor: fintechTheme.primary,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <MaterialIcons name="calculate" size={18} color={fintechTheme.white} />
              <Text style={{ color: fintechTheme.white, fontSize: 13, fontWeight: "900" }}>CALCULATE EMI</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(460)} style={{ paddingHorizontal: 16 }}>
          <SectionHeader title="Support" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { title: "Chat", detail: "Instant help", icon: "chat" },
              { title: "Advisor", detail: "Call back", icon: "support-agent" },
              { title: "FAQ", detail: "Answers", icon: "help-outline" },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.86}
                style={{
                  flex: 1,
                  backgroundColor: fintechTheme.white,
                  borderRadius: 12,
                  padding: 13,
                  borderWidth: 1,
                  borderColor: fintechTheme.border,
                  alignItems: "center",
                  shadowColor: "#8AA4C2",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 2,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: fintechTheme.softBlue, alignItems: "center", justifyContent: "center", marginBottom: 9 }}>
                  <MaterialIcons name={item.icon as any} size={18} color={fintechTheme.primary} />
                </View>
                <Text style={{ color: fintechTheme.text, fontSize: 12, fontWeight: "900" }}>{item.title}</Text>
                <Text style={{ color: fintechTheme.subText, fontSize: 10, fontWeight: "700", marginTop: 3 }}>{item.detail}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const input = {
  backgroundColor: "#FBFCFE",
  borderWidth: 1,
  borderColor: fintechTheme.border,
  paddingHorizontal: 14,
  paddingVertical: 13,
  borderRadius: 12,
  marginBottom: 12,
  fontSize: 15,
  color: fintechTheme.text,
  fontWeight: "600" as const,
};

const applicationStateCard = {
  backgroundColor: fintechTheme.white,
  borderRadius: 12,
  padding: 15,
  borderWidth: 1,
  borderColor: fintechTheme.border,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
};

const emptyApplicationCard = {
  backgroundColor: fintechTheme.white,
  borderRadius: 12,
  padding: 15,
  borderWidth: 1,
  borderColor: fintechTheme.border,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  shadowColor: "#8AA4C2",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};
