import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext";
import { getProfile, updateProfile } from "../../src/services/userApi";

const blueTheme = {
  primary: "#0F4C81",
  skyBlue: "#2563EB",
  surface: "#F5F7FA",
  white: "#FFFFFF",
  text: "#101828",
  subText: "#667085",
  border: "#EAECF0",
  lightGray: "#F2F4F7",
  paleBlue: "#EAF2FF",
  ink: "#0B1220",
  mint: "#0E9384",
  amber: "#B54708",
};

const AnimatedView = Animated.createAnimatedComponent(View);

const courseOptions = ["B.Tech", "BBA", "B.Com", "BA", "B.Sc", "MBA", "MCA", "Diploma", "Other"];
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Completed"];
const durationOptions = ["6 months", "12 months", "18 months", "24 months", "36 months", "48 months", "60 months"];
const bankOptions = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak Mahindra", "Punjab National Bank", "Bank of Baroda", "No preference"];
const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const maritalOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];

const emptyProfile = {
  name: "",
  dob: "",
  phone: "",
  email: "",
  address: "",
  pincode: "",
  pan: "",
  gender: "",
  marital: "",
  education: {
    class10: "",
    class12: "",
    college: "",
    course: "",
    year: "",
    marks: "",
  },
  financial: {
    income: "",
    loanAmount: "",
    duration: "",
    bank: "",
  },
};

function mergeProfile(user: any) {
  return {
    ...emptyProfile,
    ...user,
    education: {
      ...emptyProfile.education,
      ...(user?.education || {}),
    },
    financial: {
      ...emptyProfile.financial,
      ...(user?.financial || {}),
    },
  };
}

function normalizeProfile(profile: any) {
  const merged = mergeProfile(profile);

  return {
    name: String(merged.name || ""),
    dob: String(merged.dob || ""),
    phone: String(merged.phone || ""),
    email: String(merged.email || ""),
    address: String(merged.address || ""),
    pincode: String(merged.pincode || ""),
    pan: String(merged.pan || ""),
    gender: String(merged.gender || ""),
    marital: String(merged.marital || ""),
    education: {
      class10: String(merged.education.class10 || ""),
      class12: String(merged.education.class12 || ""),
      college: String(merged.education.college || ""),
      course: String(merged.education.course || ""),
      year: String(merged.education.year || ""),
      marks: String(merged.education.marks || ""),
    },
    financial: {
      income: String(merged.financial.income || ""),
      loanAmount: String(merged.financial.loanAmount || ""),
      duration: String(merged.financial.duration || ""),
      bank: String(merged.financial.bank || ""),
    },
  };
}

function Row({ label, value, onChangeText, keyboardType = "default", multiline = false }: any) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: blueTheme.border,
      }}
    >
      <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "700", marginBottom: 7 }}>
        {label}
      </Text>
      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={`Add ${label.toLowerCase()}`}
        placeholderTextColor="#9CA3AF"
        style={{
          color: blueTheme.text,
          fontSize: 15,
          fontWeight: "600",
          minHeight: multiline ? 64 : 30,
          paddingVertical: 0,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

function SelectRow({ label, value, onPress }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: blueTheme.border,
      }}
    >
      <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: value ? blueTheme.text : "#9CA3AF", fontSize: 15, fontWeight: "600", flex: 1 }}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={blueTheme.subText} />
      </View>
    </TouchableOpacity>
  );
}

function DateRow({ label, value, onPress }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: blueTheme.border,
      }}
    >
      <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: value ? blueTheme.text : "#9CA3AF", fontSize: 15, fontWeight: "600", flex: 1 }}>
          {value || "Select date"}
        </Text>
        <MaterialIcons name="calendar-today" size={19} color={blueTheme.subText} />
      </View>
    </TouchableOpacity>
  );
}

function SelectModal({ visible, title, options, value, onSelect, onClose }: any) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.36)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: blueTheme.white,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: 16,
            paddingBottom: 28,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: blueTheme.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="close" size={22} color={blueTheme.subText} />
            </TouchableOpacity>
          </View>

          {options.map((option: string) => {
            const selected = option === value;

            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.82}
                onPress={() => onSelect(option)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 13,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: selected ? blueTheme.paleBlue : blueTheme.white,
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: selected ? blueTheme.primary : blueTheme.text, fontSize: 15, fontWeight: "700" }}>
                  {option}
                </Text>
                {selected && <MaterialIcons name="check" size={20} color={blueTheme.primary} />}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function CalendarModal({ visible, value, onSelect, onClose }: any) {
  const formatLocalDate = (date: Date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");
    return `${dateYear}-${dateMonth}-${dateDay}`;
  };

  const initialDate = value ? new Date(value) : new Date();
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
    const selected = new Date(year, month, Number(day));
    const formatted = formatLocalDate(selected);
    onSelect(formatted);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.36)", justifyContent: "center", padding: 18 }}>
        <View style={{ backgroundColor: blueTheme.white, borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ color: blueTheme.text, fontSize: 18, fontWeight: "800" }}>Date of Birth</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="close" size={22} color={blueTheme.subText} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <TouchableOpacity onPress={() => moveMonth(-1)} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="chevron-left" size={26} color={blueTheme.primary} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setPicker("month")}
                style={{ backgroundColor: blueTheme.paleBlue, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
              >
                <Text style={{ color: blueTheme.primary, fontSize: 14, fontWeight: "800" }}>
                  {monthLabel.split(" ")[0]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setPicker("year")}
                style={{ backgroundColor: blueTheme.lightGray, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
              >
                <Text style={{ color: blueTheme.text, fontSize: 14, fontWeight: "800" }}>
                  {year}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => moveMonth(1)} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="chevron-right" size={26} color={blueTheme.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={{ width: "14.28%", textAlign: "center", color: blueTheme.subText, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
                {day}
              </Text>
            ))}
            {days.map((day, index) => {
              const dateValue = day ? formatLocalDate(new Date(year, month, Number(day))) : "";
              const selected = dateValue === value;

              return (
                <TouchableOpacity
                  key={`${day}-${index}`}
                  disabled={!day}
                  onPress={() => selectDay(day)}
                  style={{
                    width: "14.28%",
                    height: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  {!!day && (
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? blueTheme.primary : "transparent",
                      }}
                    >
                      <Text style={{ color: selected ? blueTheme.white : blueTheme.text, fontSize: 14, fontWeight: "700" }}>
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
                backgroundColor: blueTheme.white,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: 16,
                maxHeight: picker === "year" ? 420 : undefined,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ color: blueTheme.text, fontSize: 18, fontWeight: "800" }}>
                  Select {picker === "month" ? "Month" : "Year"}
                </Text>
                <TouchableOpacity onPress={() => setPicker(null)} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name="close" size={22} color={blueTheme.subText} />
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
                        backgroundColor: selected ? blueTheme.paleBlue : blueTheme.white,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: selected ? blueTheme.primary : blueTheme.text, fontSize: 15, fontWeight: "700" }}>
                        {optionLabel}
                      </Text>
                      {selected && <MaterialIcons name="check" size={20} color={blueTheme.primary} />}
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

function SectionCard({ title, icon, children, delay }: any) {
  return (
    <AnimatedView
      entering={FadeInDown.duration(600).delay(delay)}
      style={{
        backgroundColor: blueTheme.white,
        borderRadius: 10,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: blueTheme.border,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: blueTheme.border,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: blueTheme.paleBlue,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name={icon} size={18} color={blueTheme.primary} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "800", color: blueTheme.text, marginLeft: 10 }}>
          {title}
        </Text>
      </View>
      <View>{children}</View>
    </AnimatedView>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user, setUser, logout } = useUser();
  const userId = user?._id;
  const userPhone = user?.phone;
  const [data, setData] = useState<any>(normalizeProfile(user));
  const [savedData, setSavedData] = useState<any>(normalizeProfile(user));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSelect, setActiveSelect] = useState<any>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const hasChanges = useMemo(() => {
    return JSON.stringify(normalizeProfile(data)) !== JSON.stringify(normalizeProfile(savedData));
  }, [data, savedData]);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      const profile = normalizeProfile({ phone: userPhone });
      setData(profile);
      setSavedData(profile);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await getProfile(userId);
      const profile = normalizeProfile(res.data);
      setData(profile);
      setSavedData(profile);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId, userPhone]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (section: "education" | "financial", field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const openSelect = (title: string, value: string, options: string[], onSelect: (value: string) => void) => {
    setActiveSelect({ title, value, options, onSelect });
  };

  const handleSave = async () => {
    if (!userId) {
      setError("Please login again to update your profile.");
      setSuccess("");
      return;
    }

    if (!hasChanges) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await updateProfile(userId, data);
      const profile = normalizeProfile(res.data);
      setData(profile);
      setSavedData(profile);
      await setUser(res.data);
      setSuccess("Profile saved successfully.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Unable to save profile";
      setError(message);
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const initials = (data.name || data.phone || "U").trim().charAt(0).toUpperCase();
  const requiredFields = [
    data.name,
    data.dob,
    data.phone,
    data.email,
    data.address,
    data.pincode,
    data.education.course,
    data.education.year,
    data.financial.income,
    data.financial.loanAmount,
    data.pan,
  ];
  const completion = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: blueTheme.surface }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: blueTheme.ink, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 72 }}>
          <AnimatedView
            entering={FadeInDown.duration(600)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: "#98A2B3", fontSize: 12, fontWeight: "800", letterSpacing: 0 }}>
                ACCOUNT
              </Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: blueTheme.white, marginTop: 3 }}>
                Profile
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.86}
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <MaterialIcons name="logout" size={20} color={blueTheme.white} />
            </TouchableOpacity>
          </AnimatedView>
        </View>

        <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ paddingHorizontal: 16, marginTop: -52, marginBottom: 18 }}>
          <View
            style={{
              backgroundColor: blueTheme.white,
              borderRadius: 10,
              padding: 18,
              borderWidth: 1,
              borderColor: blueTheme.border,
              shadowColor: "#101828",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 14,
                  backgroundColor: blueTheme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 25, color: blueTheme.white, fontWeight: "900" }}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: blueTheme.text, marginBottom: 3 }}>
                  {data.name || "Complete your profile"}
                </Text>
                <Text style={{ fontSize: 13, color: blueTheme.subText, fontWeight: "600" }}>
                  {data.phone || "Phone not added"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={loadProfile}
                activeOpacity={0.85}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: blueTheme.lightGray,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="refresh" size={20} color={blueTheme.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: blueTheme.text, fontSize: 13, fontWeight: "800" }}>Loan readiness</Text>
                <Text style={{ color: completion >= 80 ? blueTheme.mint : blueTheme.amber, fontSize: 13, fontWeight: "900" }}>
                  {completion}%
                </Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: blueTheme.lightGray, overflow: "hidden" }}>
                <View
                  style={{
                    width: `${completion}%`,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: completion >= 80 ? blueTheme.mint : blueTheme.primary,
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: blueTheme.border }}>
                <Text style={{ color: blueTheme.subText, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>COURSE</Text>
                <Text numberOfLines={1} style={{ color: blueTheme.text, fontSize: 14, fontWeight: "900" }}>
                  {data.education.course || "Pending"}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: blueTheme.border }}>
                <Text style={{ color: blueTheme.subText, fontSize: 11, fontWeight: "800", marginBottom: 5 }}>LOAN NEED</Text>
                <Text numberOfLines={1} style={{ color: blueTheme.text, fontSize: 14, fontWeight: "900" }}>
                  {data.financial.loanAmount ? `₹${data.financial.loanAmount}` : "Pending"}
                </Text>
              </View>
            </View>
          </View>
        </AnimatedView>

      {loading && <ActivityIndicator size="large" color={blueTheme.skyBlue} style={{ marginBottom: 14 }} />}
      {!!error && (
        <Text style={{ color: "#B45309", fontSize: 13, fontWeight: "700", paddingHorizontal: 16, marginBottom: 14 }}>
          {error}
        </Text>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        <SectionCard title="Personal Information" icon="person" delay={200}>
          <Row label="Full Name" value={data.name} onChangeText={(val: string) => updateField("name", val)} />
          <DateRow label="Date of Birth" value={data.dob} onPress={() => setDatePickerOpen(true)} />
          <Row label="Phone Number" value={data.phone} keyboardType="phone-pad" onChangeText={(val: string) => updateField("phone", val)} />
          <Row label="Email Address" value={data.email} keyboardType="email-address" onChangeText={(val: string) => updateField("email", val)} />
          <Row label="Address" value={data.address} multiline onChangeText={(val: string) => updateField("address", val)} />
          <Row label="Pincode" value={data.pincode} keyboardType="numeric" onChangeText={(val: string) => updateField("pincode", val)} />
        </SectionCard>

        <SectionCard title="Education Details" icon="school" delay={300}>
          <Row label="10th Marks" value={String(data.education.class10 || "")} keyboardType="numeric" onChangeText={(val: string) => updateNestedField("education", "class10", val)} />
          <Row label="12th Marks" value={String(data.education.class12 || "")} keyboardType="numeric" onChangeText={(val: string) => updateNestedField("education", "class12", val)} />
          <SelectRow
            label="Course"
            value={data.education.course}
            onPress={() => openSelect("Course", data.education.course, courseOptions, (val) => updateNestedField("education", "course", val))}
          />
          <Row label="College/University" value={data.education.college} onChangeText={(val: string) => updateNestedField("education", "college", val)} />
          <SelectRow
            label="Current Year"
            value={data.education.year}
            onPress={() => openSelect("Current Year", data.education.year, yearOptions, (val) => updateNestedField("education", "year", val))}
          />
          <Row label="Current Marks (%)" value={data.education.marks} keyboardType="numeric" onChangeText={(val: string) => updateNestedField("education", "marks", val)} />
        </SectionCard>

        <SectionCard title="Loan Preferences" icon="account-balance-wallet" delay={400}>
          <Row label="Annual Income" value={String(data.financial.income || "")} keyboardType="numeric" onChangeText={(val: string) => updateNestedField("financial", "income", val)} />
          <Row label="Loan Amount" value={data.financial.loanAmount} keyboardType="numeric" onChangeText={(val: string) => updateNestedField("financial", "loanAmount", val)} />
          <SelectRow
            label="Preferred Duration"
            value={data.financial.duration}
            onPress={() => openSelect("Preferred Duration", data.financial.duration, durationOptions, (val) => updateNestedField("financial", "duration", val))}
          />
          <SelectRow
            label="Preferred Bank"
            value={data.financial.bank}
            onPress={() => openSelect("Preferred Bank", data.financial.bank, bankOptions, (val) => updateNestedField("financial", "bank", val))}
          />
        </SectionCard>

        <SectionCard title="Identity Information" icon="verified-user" delay={500}>
          <Row label="PAN Number" value={data.pan} onChangeText={(val: string) => updateField("pan", val)} />
          <SelectRow
            label="Gender"
            value={data.gender}
            onPress={() => openSelect("Gender", data.gender, genderOptions, (val) => updateField("gender", val))}
          />
          <SelectRow
            label="Marital Status"
            value={data.marital}
            onPress={() => openSelect("Marital Status", data.marital, maritalOptions, (val) => updateField("marital", val))}
          />
        </SectionCard>

        <AnimatedView entering={FadeInDown.duration(600).delay(600)}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !hasChanges}
            activeOpacity={0.88}
            style={{
              backgroundColor: saving || !hasChanges ? "#CBD5E1" : blueTheme.primary,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              marginBottom: 10,
              opacity: saving || !hasChanges ? 0.8 : 1,
            }}
          >
            <Text style={{ color: saving || !hasChanges ? "#64748B" : blueTheme.white, fontWeight: "800", fontSize: 15 }}>
              {saving ? "SAVING..." : hasChanges ? "SAVE CHANGES" : "NO CHANGES"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.88}
            style={{
              backgroundColor: blueTheme.white,
              borderWidth: 1,
              borderColor: "#FCA5A5",
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <MaterialIcons name="logout" size={18} color="#DC2626" />
            <Text style={{ color: "#DC2626", fontWeight: "800", fontSize: 15 }}>
              LOGOUT
            </Text>
          </TouchableOpacity>
        </AnimatedView>
      </View>
      </ScrollView>

      {!!success && (
        <AnimatedView
          entering={FadeInDown.duration(220)}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: "#111827",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <MaterialIcons name="check-circle" size={20} color="#34D399" />
          <Text style={{ color: blueTheme.white, fontSize: 14, fontWeight: "800", flex: 1 }}>
            {success}
          </Text>
        </AnimatedView>
      )}

      <SelectModal
        visible={!!activeSelect}
        title={activeSelect?.title}
        value={activeSelect?.value}
        options={activeSelect?.options || []}
        onClose={() => setActiveSelect(null)}
        onSelect={(value: string) => {
          activeSelect?.onSelect(value);
          setActiveSelect(null);
        }}
      />
      <CalendarModal
        visible={datePickerOpen}
        value={data.dob}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(value: string) => {
          updateField("dob", value);
          setDatePickerOpen(false);
        }}
      />
    </View>
  );
}
