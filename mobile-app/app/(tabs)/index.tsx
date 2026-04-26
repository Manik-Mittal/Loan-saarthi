import { Redirect } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import { Text, View } from "react-native";

export default function Index() {
    const { user, loading } = useUser();

    // ⏳ Wait until AsyncStorage loads
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    // If user exists → go to Home
    if (user) {
        return <Redirect href="/(tabs)/home" />;
    }

    //  If no user → go to Login
    return <Redirect href="/login" />;
}