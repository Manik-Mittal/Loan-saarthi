import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { colors } from "../../src/constants/colors";

// Modern Blue Theme (Minimal)
const blueTheme = {
  primary: "#003087",
  skyBlue: "#0066CC",
  surface: "#FAFBFC",
  white: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#E5E7EB",
  lightGray: "#F3F4F6",
};

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Profile() {
  const [data, setData] = useState({
    name: "Manik Mittal",
    dob: "**/**/2003",
    phone: "******63240",
    email: "man********@gmail.com",
    address: "Delhi, India",
    course: "B.Tech",
    college: "ABC University",
    year: "2nd Year",
    marks: "85%",
    loanAmount: "₹10,00,000",
    duration: "5 Years",
    bank: "SBI",
    pan: "*****443J",
    gender: "Male",
    marital: "Single",
  });

  const Row = ({ label, value, editable, field }: any) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: blueTheme.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "500", marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "600", color: blueTheme.text }}>
          {value}
        </Text>
      </View>

      {editable && (
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: blueTheme.lightGray,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 12,
          }}
          onPress={() => alert(`Edit ${field}`)}
        >
          <MaterialIcons name="edit" size={18} color={blueTheme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const SectionCard = ({ title, icon, children, delay }: any) => (
    <AnimatedView
      entering={FadeInDown.duration(600).delay(delay)}
      style={{
        backgroundColor: blueTheme.white,
        borderRadius: 12,
        marginBottom: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: blueTheme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: blueTheme.border,
        }}
      >
        <MaterialIcons name={icon} size={20} color={blueTheme.primary} />
        <Text style={{ fontSize: 14, fontWeight: "700", color: blueTheme.text, marginLeft: 10 }}>
          {title}
        </Text>
      </View>
      <View>{children}</View>
    </AnimatedView>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: blueTheme.surface }}
      contentContainerStyle={{ paddingVertical: 16, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <AnimatedView entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: blueTheme.text, marginBottom: 4 }}>
          My Profile
        </Text>
        <Text style={{ fontSize: 13, color: blueTheme.subText }}>
          Manage your information
        </Text>
      </AnimatedView>

      {/* PROFILE CARD */}
      <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <View
          style={{
            backgroundColor: blueTheme.white,
            borderRadius: 14,
            padding: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: blueTheme.border,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: blueTheme.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32, color: blueTheme.white, fontWeight: "800" }}>M</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: "700", color: blueTheme.text, marginBottom: 2 }}>
            {data.name}
          </Text>
          <Text style={{ fontSize: 12, color: blueTheme.subText, marginBottom: 16 }}>
            {data.course} • {data.year}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: blueTheme.lightGray,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              gap: 8,
            }}
          >
            <MaterialIcons name="photo-camera" size={16} color={blueTheme.primary} />
            <Text style={{ color: blueTheme.primary, fontWeight: "600", fontSize: 13 }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>
      </AnimatedView>

      {/* PERSONAL DETAILS */}
      <View style={{ paddingHorizontal: 16 }}>
        <SectionCard title="Personal Information" icon="person" delay={200}>
          <Row label="Full Name" value={data.name} />
          <Row label="Date of Birth" value={data.dob} editable field="dob" />
          <Row label="Phone Number" value={data.phone} editable field="phone" />
          <Row label="Email Address" value={data.email} editable field="email" />
          <Row label="Address" value={data.address} editable field="address" />
        </SectionCard>

        {/* EDUCATION DETAILS */}
        <SectionCard title="Education Details" icon="school" delay={300}>
          <Row label="Course" value={data.course} editable field="course" />
          <Row label="College/University" value={data.college} editable field="college" />
          <Row label="Current Year" value={data.year} editable field="year" />
          <Row label="Current Marks (%)" value={data.marks} editable field="marks" />
        </SectionCard>

        {/* LOAN DETAILS */}
        <SectionCard title="Loan Preferences" icon="attach-money" delay={400}>
          <Row label="Loan Amount" value={data.loanAmount} editable field="loan" />
          <Row label="Preferred Duration" value={data.duration} editable field="duration" />
          <Row label="Preferred Bank" value={data.bank} editable field="bank" />
        </SectionCard>

        {/* KYC DETAILS */}
        <SectionCard title="Identity Information" icon="verified-user" delay={500}>
          <Row label="PAN Number" value={data.pan} />
          <Row label="Gender" value={data.gender} editable field="gender" />
          <Row label="Marital Status" value={data.marital} editable field="marital" />
        </SectionCard>

        {/* ACTION BUTTONS */}
        <AnimatedView entering={FadeInDown.duration(600).delay(600)}>
          <TouchableOpacity
            style={{
              backgroundColor: blueTheme.primary,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: blueTheme.white, fontWeight: "700", fontSize: 15 }}>
              SAVE CHANGES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: blueTheme.white,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: blueTheme.primary,
            }}
          >
            <Text style={{ color: blueTheme.primary, fontWeight: "600", fontSize: 15 }}>
              Download Profile
            </Text>
          </TouchableOpacity>
        </AnimatedView>
      </View>
    </ScrollView>
  );
}
// import { View, Text } from "react-native";

// export default function Profile() {
//   return (
//     <View>
//       <Text>ok</Text>
//     </View>
//   );
// }