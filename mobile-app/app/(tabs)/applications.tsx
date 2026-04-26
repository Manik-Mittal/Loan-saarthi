import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Btn from "@/src/components/Btn";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";

export default function ApplyTab() {
  const router = useRouter();

  return (

    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        Apply for Loan
      </Text>

      <Btn
        title="Start Application"
        onPress={() => router.push("/apply/step1")}
      />
    </View>


  );
}

// import { View, Text } from "react-native";

// export default function Applications() {
//   return (
//     <View>
//       <Text>ok</Text>
//     </View>
//   );
// }