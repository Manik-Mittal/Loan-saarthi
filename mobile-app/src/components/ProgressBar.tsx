import { View } from "react-native";
import { colors } from "../constants/colors";

export default function ProgressBar({ progress }: any) {
    return (
        <View
            style={{
                height: 6,
                backgroundColor: "#E5E7EB",
                borderRadius: 10,
                marginBottom: 16,
            }}
        >
            <View
                style={{
                    width: `${progress}%`,
                    height: 6,
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                }}
            />
        </View>
    );
}