import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { updatePushToken } from "./userApi";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const getProjectId = () =>
  process.env.EXPO_PUBLIC_EXPO_PROJECT_ID ||
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId ||
  "";

const isExpoGo = Constants.appOwnership === "expo";

export function getPushNotificationsUnavailableReason() {
  if (Platform.OS === "web") {
    return "Push notifications are not supported on web in this app.";
  }

  if (isExpoGo) {
    return "Push notifications are not supported in Expo Go. Install a development build on your phone to test notifications.";
  }

  if (!Device.isDevice) {
    return "Push notifications require a physical device.";
  }

  if (!getProjectId()) {
    return "Missing Expo project ID. Add EXPO_PUBLIC_EXPO_PROJECT_ID before testing push notifications.";
  }

  return "";
}

export async function registerUserPushToken(user: any) {
  if (!user?._id) {
    return null;
  }

  const existingTokens = Array.isArray(user.expoPushTokens) ? user.expoPushTokens : [];
  const unavailableReason = getPushNotificationsUnavailableReason();

  if (unavailableReason) {
    console.log(`Push notification setup skipped: ${unavailableReason}`);
    return null;
  }
  const projectId = getProjectId();

  const permission = await Notifications.getPermissionsAsync();
  let status = permission.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    console.log("Push notification permission not granted.");
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = String(tokenResponse.data || "").trim();

  if (!token) {
    return null;
  }

  const alreadySaved = existingTokens.some((entry: any) => String(entry?.token || "").trim() === token);
  if (alreadySaved) {
    return token;
  }

  await updatePushToken(user._id, {
    token,
    platform: Platform.OS,
  });

  return token;
}
