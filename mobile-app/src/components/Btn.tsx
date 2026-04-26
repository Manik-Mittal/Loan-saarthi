import { TouchableOpacity, Text } from "react-native";
import { colors } from "../constants/colors";

export default function Btn({ title, onPress, disabled = false }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={{
                backgroundColor: disabled ? "#CBD5E1" : colors.primary,
                padding: 14,
                borderRadius: 10,
                marginVertical: 6,
                opacity: disabled ? 0.6 : 1
            }}
        >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}