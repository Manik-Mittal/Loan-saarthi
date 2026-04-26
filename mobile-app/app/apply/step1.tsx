import { View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import ProgressBar from "../../src/components/ProgressBar";
import Btn from "../../src/components/Btn";

export default function Step1() {
    const router = useRouter();

    const [data, setData] = useState({
        name: "",
        address: "",
        pincode: "",
    });

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <ProgressBar progress={25} />

            <Text style={{ fontSize: 20, fontWeight: "700" }}>
                Personal Details
            </Text>

            <TextInput placeholder="Full Name" style={input} />
            <TextInput placeholder="Address" style={input} />
            <TextInput placeholder="Pincode" style={input} />

            <Btn title="Next" onPress={() => router.push("/apply/step2")} />
        </View>
    );
}

const input = {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
};