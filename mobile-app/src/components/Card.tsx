import { View, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

export default function Card({ children, style }: any) {
    const renderChildren = () => {
        // if it's plain text
        if (typeof children === "string" || typeof children === "number") {
            return <Text>{children}</Text>;
        }

        // if it's array (VERY IMPORTANT)
        if (Array.isArray(children)) {
            return children.map((child, index) => {
                if (typeof child === "string" || typeof child === "number") {
                    return <Text key={index}>{child}</Text>;
                }
                return child;
            });
        }

        return children;
    };

    return (
        <View style={[styles.card, style]}>
            {renderChildren()}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 14,
        marginVertical: 8,

        // iOS shadow
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },

        // Android shadow
        elevation: 4,
    },
});