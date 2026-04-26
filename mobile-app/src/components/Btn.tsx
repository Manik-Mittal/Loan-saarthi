import { TouchableOpacity, Text } from "react-native";
import { colors } from "../constants/colors";

export default function Btn({ title, onPress }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: colors.primary,
                padding: 14,
                borderRadius: 10,
                marginVertical: 6
            }}
        >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}