import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUser } from "../src/context/UserContext";
import { updateProfile } from "../src/services/userApi";
import { getPincodeServiceMessage, isDelhiNcrPincode, normalizePincode } from "../src/utils/serviceability";

const theme = {
  primary: "#2F6FED",
  ink: "#172033",
  mint: "#18A999",
  surface: "#F7FAFD",
  white: "#FFFFFF",
  text: "#172033",
  subText: "#758195",
  border: "#E8EEF5",
  lightGray: "#F1F5FA",
  paleBlue: "#EDF5FF",
};

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
const AnimatedView = Animated.createAnimatedComponent(View);

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={theme.subText}
        style={{
          backgroundColor: "#FBFCFE",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          color: theme.text,
          fontSize: 15,
          fontWeight: "700",
          minHeight: multiline ? 82 : 50,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

function DateField({ label, value, onPress }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={onPress}
        style={{
          backgroundColor: "#FBFCFE",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          minHeight: 50,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: value ? theme.text : theme.subText, fontSize: 15, fontWeight: "700", flex: 1 }}>
          {value || "Select date"}
        </Text>
        <MaterialIcons name="calendar-today" size={19} color={theme.subText} />
      </TouchableOpacity>
    </View>
  );
}

function CalendarModal({ visible, value, onSelect, onClose }: any) {
  const formatLocalDate = (date: Date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");
    return `${dateYear}-${dateMonth}-${dateDay}`;
  };

  const todayValue = formatLocalDate(new Date());
  const selectedValue = value || todayValue;
  const initialDate = new Date(selectedValue);
  const [monthDate, setMonthDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [picker, setPicker] = useState<"month" | "year" | null>(null);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    label: new Date(2000, index, 1).toLocaleDateString("en-IN", { month: "long" }),
    value: index,
  }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1942 + 1 }, (_, index) => currentYear - index);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [
    ...Array.from({ length: firstDay }, () => ""),
    ...Array.from({ length: daysInMonth }, (_, index) => String(index + 1)),
  ];
  const monthLabel = monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const moveMonth = (step: number) => {
    setMonthDate(new Date(year, month + step, 1));
  };

  const changeMonth = (nextMonth: number) => {
    setMonthDate(new Date(year, nextMonth, 1));
    setPicker(null);
  };

  const changeYear = (nextYear: number) => {
    setMonthDate(new Date(nextYear, month, 1));
    setPicker(null);
  };

  const selectDay = (day: string) => {
    onSelect(formatLocalDate(new Date(year, month, Number(day))));
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.36)", justifyContent: "center", padding: 18 }}>
        <View style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>Date of Birth</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <TouchableOpacity onPress={() => moveMonth(-1)} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="chevron-left" size={26} color={theme.primary} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setPicker("month")}
                style={{ backgroundColor: theme.paleBlue, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
              >
                <Text style={{ color: theme.primary, fontSize: 14, fontWeight: "800" }}>
                  {monthLabel.split(" ")[0]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setPicker("year")}
                style={{ backgroundColor: theme.lightGray, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
              >
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: "800" }}>
                  {year}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => moveMonth(1)} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="chevron-right" size={26} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={{ width: "14.28%", textAlign: "center", color: theme.subText, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                {day}
              </Text>
            ))}
            {days.map((day, index) => {
              const dateValue = day ? formatLocalDate(new Date(year, month, Number(day))) : "";
              const selected = dateValue === selectedValue;

              return (
                <TouchableOpacity
                  key={`${day}-${index}`}
                  disabled={!day}
                  onPress={() => selectDay(day)}
                  style={{ width: "14.28%", height: 42, alignItems: "center", justifyContent: "center", marginBottom: 4 }}
                >
                  {!!day && (
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? theme.primary : "transparent",
                      }}
                    >
                      <Text style={{ color: selected ? theme.white : theme.text, fontSize: 14, fontWeight: "700" }}>
                        {day}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Modal transparent visible={!!picker} animationType="fade" onRequestClose={() => setPicker(null)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setPicker(null)}
            style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.18)", justifyContent: "flex-end" }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: theme.white,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: 16,
                maxHeight: picker === "year" ? 420 : undefined,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>
                  Select {picker === "month" ? "Month" : "Year"}
                </Text>
                <TouchableOpacity onPress={() => setPicker(null)} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name="close" size={22} color={theme.subText} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {(picker === "month" ? monthOptions : yearOptions).map((option: any) => {
                  const optionLabel = picker === "month" ? option.label : String(option);
                  const selected = picker === "month" ? option.value === month : option === year;

                  return (
                    <TouchableOpacity
                      key={optionLabel}
                      activeOpacity={0.82}
                      onPress={() => (picker === "month" ? changeMonth(option.value) : changeYear(option))}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 13,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        backgroundColor: selected ? theme.paleBlue : theme.white,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: selected ? theme.primary : theme.text, fontSize: 15, fontWeight: "700" }}>
                        {optionLabel}
                      </Text>
                      {selected && <MaterialIcons name="check" size={20} color={theme.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

function OptionModal({ visible, title, options, value, onSelect, onClose }: any) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.36)", justifyContent: "flex-end" }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: theme.white,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: 16,
            paddingBottom: 28,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option: string) => {
              const selected = option === value;

              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.84}
                  onPress={() => onSelect(option)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 13,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: selected ? theme.paleBlue : theme.white,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: selected ? theme.primary : theme.text, fontSize: 15, fontWeight: "800", flex: 1 }}>
                    {option}
                  </Text>
                  {selected && <MaterialIcons name="check" size={20} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();
  const [form, setForm] = useState({
    name: user?.name || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    address: {
      line1: user?.address?.line1 || "",
      line2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      country: user?.address?.country || "India",
    },
  });
  const [genderOpen, setGenderOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const normalizedPincode = normalizePincode(form.address.pincode);
  const pincodeServiceMessage = useMemo(() => getPincodeServiceMessage(normalizedPincode), [normalizedPincode]);
  const pincodeIsServiceable = useMemo(() => isDelhiNcrPincode(normalizedPincode), [normalizedPincode]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.surface }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user?.isNewUser === false) {
    return <Redirect href="/(tabs)/home" />;
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: field === "pincode" ? normalizePincode(value) : value },
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.dob.trim()) return "Please enter your date of birth.";
    if (!form.gender.trim()) return "Please select your gender.";
    if (!form.address.line1.trim()) return "Please enter address line 1.";
    if (!form.address.city.trim()) return "Please enter your city.";
    if (!form.address.state.trim()) return "Please enter your state.";
    if (!/^\d{6}$/.test(normalizedPincode)) return "Please enter a valid 6 digit pincode.";
    return "";
  };

  const handleSubmit = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const addressText = [
        form.address.line1.trim(),
        form.address.line2.trim(),
        form.address.city.trim(),
        form.address.state.trim(),
        form.address.country.trim(),
      ].filter(Boolean).join(", ");
      const structuredAddress = {
        line1: form.address.line1.trim(),
        line2: form.address.line2.trim(),
        city: form.address.city.trim(),
        state: form.address.state.trim(),
        pincode: form.address.pincode.trim(),
        country: form.address.country,
      };
      const payload = {
        name: form.name.trim(),
        dob: form.dob.trim(),
        gender: form.gender.trim(),
        phone: user.phone,
        address: addressText,
        pincode: form.address.pincode.trim(),
      };
      const res = await updateProfile(user._id, payload);
      await setUser({ ...res.data, address: structuredAddress, pincode: form.address.pincode.trim() });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
      >
        <AnimatedView entering={FadeInDown.duration(600)} style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              backgroundColor: theme.paleBlue,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <MaterialIcons name="person-add-alt-1" size={34} color={theme.primary} />
          </View>
          <Text style={{ color: theme.text, fontSize: 27, fontWeight: "900", textAlign: "center" }}>
            Complete your profile
          </Text>
          <Text style={{ color: theme.subText, fontSize: 14, fontWeight: "700", textAlign: "center", marginTop: 7, lineHeight: 20 }}>
            We need a few details before checking personalized loan options.
          </Text>

        </AnimatedView>

        <AnimatedView
          entering={FadeInDown.duration(600).delay(120)}
          style={{
            backgroundColor: theme.white,
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: "#8AA4C2",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 18,
            elevation: 3,
          }}
        >
          <Field label="FULL NAME" value={form.name} onChangeText={(value: string) => updateField("name", value)} placeholder="Enter your full name" />
          <DateField label="DATE OF BIRTH" value={form.dob} onPress={() => setDatePickerOpen(true)} />

          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
              GENDER
            </Text>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => setGenderOpen(true)}
              style={{
                backgroundColor: "#FBFCFE",
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                minHeight: 50,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: form.gender ? theme.text : theme.subText, fontSize: 15, fontWeight: "700" }}>
                {form.gender || "Select gender"}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <Field label="ADDRESS LINE 1" value={form.address.line1} onChangeText={(value: string) => updateAddressField("line1", value)} placeholder="Enter your street address" />
          <Field label="ADDRESS LINE 2" value={form.address.line2} onChangeText={(value: string) => updateAddressField("line2", value)} placeholder="Apt, suite, etc. (optional)" />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="CITY" value={form.address.city} onChangeText={(value: string) => updateAddressField("city", value)} placeholder="Enter city name" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: theme.text, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                  STATE/UT
                </Text>
                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={() => setStateOpen(true)}
                  style={{
                    backgroundColor: "#FBFCFE",
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    minHeight: 50,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text numberOfLines={1} style={{ color: form.address.state ? theme.text : theme.subText, fontSize: 15, fontWeight: "700", flex: 1 }}>
                    {form.address.state || "Select state"}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.subText} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="PINCODE" value={form.address.pincode} onChangeText={(value: string) => updateAddressField("pincode", value)} placeholder="6 digit pincode" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="COUNTRY" value={form.address.country} onChangeText={(value: string) => updateAddressField("country", value)} placeholder="Country" />
            </View>
          </View>

          {!!pincodeServiceMessage && (
            <View
              style={{
                backgroundColor: pincodeIsServiceable ? "#E8F5E9" : "#FFF3E0",
                borderLeftWidth: 4,
                borderLeftColor: pincodeIsServiceable ? "#2E7D32" : "#FF9800",
                borderRadius: 8,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: pincodeIsServiceable ? "#2E7D32" : "#E65100", fontSize: 13, fontWeight: "700", marginBottom: 4 }}>
                {pincodeIsServiceable ? "Service Available" : "Service Not Available"}
              </Text>
              <Text style={{ color: pincodeIsServiceable ? "#2E7D32" : "#E65100", fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
                {pincodeIsServiceable ? pincodeServiceMessage : `${pincodeServiceMessage}. You can still continue and complete your profile.`}
              </Text>
            </View>
          )}

          {!!error && (
            <Text style={{ color: "#B45309", fontSize: 13, fontWeight: "700", marginBottom: 14 }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={saving}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: saving ? 0.72 : 1,
            }}
          >
            <Text style={{ color: theme.white, fontSize: 15, fontWeight: "900" }}>
              {saving ? "SAVING..." : "SAVE PROFILE"}
            </Text>
            {!saving && <MaterialIcons name="arrow-forward" size={18} color={theme.white} style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </AnimatedView>
      </ScrollView>

      <OptionModal
        visible={genderOpen}
        title="Select Gender"
        options={genderOptions}
        value={form.gender}
        onClose={() => setGenderOpen(false)}
        onSelect={(value: string) => {
          updateField("gender", value);
          setGenderOpen(false);
        }}
      />
      <OptionModal
        visible={stateOpen}
        title="Select State/UT"
        options={stateOptions}
        value={form.address.state}
        onClose={() => setStateOpen(false)}
        onSelect={(value: string) => {
          updateAddressField("state", value);
          setStateOpen(false);
        }}
      />
      <CalendarModal
        visible={datePickerOpen}
        value={form.dob}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(value: string) => {
          updateField("dob", value);
          setDatePickerOpen(false);
        }}
      />
    </View>
  );
}
