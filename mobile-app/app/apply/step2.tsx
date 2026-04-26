import { View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import ProgressBar from "../../src/components/ProgressBar";
import Btn from "../../src/components/Btn";

export default function Step2() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <ProgressBar progress={50} />

            <Text style={{ fontSize: 20, fontWeight: "700" }}>
                Education Details
            </Text>

            <TextInput placeholder="10th Board %" style={input} />
            <TextInput placeholder="12th Board %" style={input} />
            <TextInput placeholder="School Name" style={input} />
            <TextInput placeholder="College Name" style={input} />

            <Btn title="Next" onPress={() => router.push("/apply/step3")} />
        </View>
    );
}

const input = {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
};