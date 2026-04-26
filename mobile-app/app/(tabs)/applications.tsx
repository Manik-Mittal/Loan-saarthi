import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

const applications = [
  {
    id: 1,
    title: "Education Loan",
    amount: "Rs. 8,50,000",
    status: "In Review",
    statusColor: blueTheme.warning,
    updated: "Updated today",
    progress: 68,
  },
  {
    id: 2,
    title: "Skill Course Loan",
    amount: "Rs. 1,20,000",
    status: "Approved",
    statusColor: blueTheme.success,
    updated: "Disbursal pending",
    progress: 92,
  },
];

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
            {item.title}
          </Text>
          <Text style={{ color: blueTheme.subText, fontSize: 13, marginTop: 4 }}>
            {item.amount}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${item.statusColor}18`,
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: item.statusColor, fontSize: 12, fontWeight: "800" }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <View
          style={{
            height: 8,
            borderRadius: 8,
            backgroundColor: "#EEF2F7",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${item.progress}%`,
              height: "100%",
              borderRadius: 8,
              backgroundColor: blueTheme.skyBlue,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "600" }}>
            {item.updated}
          </Text>
          <Text style={{ color: blueTheme.primary, fontSize: 12, fontWeight: "800" }}>
            {item.progress}% complete
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ApplyTab() {
  const router = useRouter();

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
            Track your loan requests and start a new application when you are ready.
          </Text>
        </AnimatedView>

        <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ marginBottom: 18 }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/apply")}
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

        <AnimatedView entering={FadeInDown.duration(600).delay(180)} style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <SummaryTile label="Active" value="2" icon="assignment" color={blueTheme.primary} />
          <SummaryTile label="Approved" value="1" icon="verified" color={blueTheme.success} />
          <SummaryTile label="Pending" value="1" icon="schedule" color={blueTheme.warning} />
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(600).delay(260)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: blueTheme.text }}>
              Recent Applications
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "800", color: blueTheme.skyBlue }}>
              View All
            </Text>
          </View>

          {applications.map((item) => (
            <ApplicationCard key={item.id} item={item} />
          ))}
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
}
