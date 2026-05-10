import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const theme = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  ink: "#0F213F",
  body: "#5D6D87",
  primary: "#1555D6",
  border: "#DCE7F4",
};

const faqItems = [
  {
    q: "Who can apply for an education loan?",
    a: "Students with confirmed admission in recognized institutes in India or abroad can apply. A co-applicant is usually required.",
  },
  {
    q: "What expenses are covered?",
    a: "Tuition fees, hostel fees, exam/library/lab charges, books, and in some cases travel and laptop expenses.",
  },
  {
    q: "How much margin money is needed?",
    a: "Many lenders ask for a margin contribution above certain loan amounts. This differs by lender and course type.",
  },
  {
    q: "What is moratorium period?",
    a: "It is the period during course + a few months after completion where full EMI may not be required.",
  },
  {
    q: "What documents are usually required?",
    a: "KYC (Aadhaar/PAN), admission letter, fee structure, academic marksheets, income proof of co-applicant, and bank statements.",
  },
  {
    q: "How is interest charged during study period?",
    a: "Simple interest is typically charged during moratorium; repayment structure depends on lender policy.",
  },
];

export default function FAQScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.86}
            style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center", backgroundColor: theme.white }}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: theme.ink, fontSize: 22, fontWeight: "900" }}>Education Loan FAQ</Text>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600" }}>Important student-focused information</Text>
          </View>
        </View>

        {faqItems.map((item) => (
          <View
            key={item.q}
            style={{
              backgroundColor: theme.white,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "800", marginBottom: 6 }}>{item.q}</Text>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
