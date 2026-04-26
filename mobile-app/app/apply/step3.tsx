import { View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import ProgressBar from "../../src/components/ProgressBar";
import Btn from "../../src/components/Btn";

export default function Step3() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <ProgressBar progress={75} />

            <Text style={{ fontSize: 20, fontWeight: "700" }}>
                Financial Details
            </Text>

            <TextInput placeholder="Annual Family Income" style={input} />

            <Btn title="Next" onPress={() => router.push("/apply/step4")} />
        </View>
    );
}

const input = {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
};