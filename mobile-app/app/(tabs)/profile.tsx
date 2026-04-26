import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useUser } from "../../src/context/UserContext";
import { getProfile, updateProfile } from "../../src/services/userApi";

const blueTheme = {
  primary: "#003087",
  skyBlue: "#0066CC",
  surface: "#FAFBFC",
  white: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#E5E7EB",
  lightGray: "#F3F4F6",
  paleBlue: "#E8F2FF",
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: blueTheme.border,
      }}
    >
      <Text style={{ color: blueTheme.subText, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
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
          minHeight: multiline ? 58 : 28,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
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
  const initialDate = value ? new Date(value) : new Date(2003, 0, 1);
  const [monthDate, setMonthDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
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

  const selectDay = (day: string) => {
    const selected = new Date(year, month, Number(day));
    const formatted = selected.toISOString().slice(0, 10);
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
            <Text style={{ color: blueTheme.text, fontSize: 16, fontWeight: "800" }}>{monthLabel}</Text>
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
              const dateValue = day ? new Date(year, month, Number(day)).toISOString().slice(0, 10) : "";
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
        borderRadius: 12,
        marginBottom: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: blueTheme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: blueTheme.border,
        }}
      >
        <MaterialIcons name={icon} size={20} color={blueTheme.primary} />
        <Text style={{ fontSize: 14, fontWeight: "800", color: blueTheme.text, marginLeft: 10 }}>
          {title}
        </Text>
      </View>
      <View>{children}</View>
    </AnimatedView>
  );
}

export default function Profile() {
  const { user, setUser } = useUser();
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

  const initials = (data.name || data.phone || "U").trim().charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: blueTheme.surface }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: blueTheme.text, marginBottom: 4 }}>
          My Profile
        </Text>
        <Text style={{ fontSize: 13, color: blueTheme.subText }}>
          Manage the information used for loan applications
        </Text>
      </AnimatedView>

      <AnimatedView entering={ZoomIn.duration(600).delay(100)} style={{ paddingHorizontal: 16, marginBottom: 18 }}>
        <View
          style={{
            backgroundColor: blueTheme.white,
            borderRadius: 14,
            padding: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: blueTheme.border,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: blueTheme.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32, color: blueTheme.white, fontWeight: "800" }}>{initials}</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: "800", color: blueTheme.text, marginBottom: 2 }}>
            {data.name || "Add your name"}
          </Text>
          <Text style={{ fontSize: 12, color: blueTheme.subText, marginBottom: 14 }}>
            {data.education.course || "Course not added"} • {data.education.year || "Year not added"}
          </Text>

          <TouchableOpacity
            onPress={loadProfile}
            activeOpacity={0.85}
            style={{
              backgroundColor: blueTheme.lightGray,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              gap: 8,
            }}
          >
            <MaterialIcons name="refresh" size={16} color={blueTheme.primary} />
            <Text style={{ color: blueTheme.primary, fontWeight: "700", fontSize: 13 }}>
              Refresh Profile
            </Text>
          </TouchableOpacity>
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
