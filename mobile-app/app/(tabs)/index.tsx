import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useUser } from "../../src/context/UserContext";

const ADMIN_PHONE = String(process.env.EXPO_PUBLIC_ADMIN_PHONE || "").replace(/\D/g, "").slice(-10);

export default function Index() {
  const { user, loading } = useUser();
  const currentPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user) {
    if (ADMIN_PHONE && currentPhone === ADMIN_PHONE) {
      return <Redirect href="/admin-callbacks" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}
