import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "../src/context/UserContext";
import { requestCallback } from "../src/services/callbackApi";

const theme = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  ink: "#0F213F",
  body: "#5D6D87",
  primary: "#1555D6",
  border: "#DCE7F4",
  success: "#159A88",
  warning: "#E18C2B",
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.ink, fontSize: 12, fontWeight: "800", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9BA8BC"
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          backgroundColor: theme.white,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 11,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: theme.ink,
          fontSize: 14,
          fontWeight: "600",
          minHeight: multiline ? 90 : 44,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export default function RequestCallbackScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({
    name: String(user?.name || ""),
    phone: String(user?.phone || ""),
    email: String(user?.email || ""),
    preferredTime: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    const phone = form.phone.replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10 digit mobile number");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await requestCallback({
        userId: user?._id,
        name: form.name.trim(),
        phone,
        email: form.email.trim(),
        preferredTime: form.preferredTime.trim(),
        message: form.message.trim(),
      });
      setSuccess("Callback request submitted. Our team will contact you.");
      setForm((prev) => ({ ...prev, preferredTime: "", message: "" }));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Unable to submit callback request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.86}
            style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center", backgroundColor: theme.white }}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.primary} />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: theme.ink, fontSize: 22, fontWeight: "900" }}>Request A Callback</Text>
            <Text style={{ color: theme.body, fontSize: 12, fontWeight: "600" }}>Share your query and preferred time</Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.white, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 14 }}>
          <Field label="Name" value={form.name} onChangeText={(text) => update("name", text)} placeholder="Your full name" />
          <Field label="Phone Number" value={form.phone} onChangeText={(text) => update("phone", text)} placeholder="10 digit number" keyboardType="phone-pad" />
          <Field label="Email (Optional)" value={form.email} onChangeText={(text) => update("email", text)} placeholder="you@example.com" keyboardType="email-address" />
          <Field label="Preferred Time" value={form.preferredTime} onChangeText={(text) => update("preferredTime", text)} placeholder="e.g. 4 PM to 6 PM" />
          <Field label="Message" value={form.message} onChangeText={(text) => update("message", text)} placeholder="What do you need help with?" multiline />

          {!!error && <Text style={{ color: theme.warning, fontSize: 12, fontWeight: "700", marginBottom: 10 }}>{error}</Text>}
          {!!success && <Text style={{ color: theme.success, fontSize: 12, fontWeight: "700", marginBottom: 10 }}>{success}</Text>}

          <TouchableOpacity
            onPress={submit}
            activeOpacity={0.88}
            disabled={saving}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 11,
              paddingVertical: 13,
              alignItems: "center",
              justifyContent: "center",
              opacity: saving ? 0.75 : 1,
            }}
          >
            <Text style={{ color: theme.white, fontSize: 14, fontWeight: "900" }}>{saving ? "SUBMITTING..." : "SUBMIT CALLBACK REQUEST"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
