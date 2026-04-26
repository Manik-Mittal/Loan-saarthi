import { View, Text, ScrollView, TextInput, FlatList, Image, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn, BounceInDown } from "react-native-reanimated";
import Card from "../../src/components/Card";
import Btn from "../../src/components/Btn";
import { colors } from "../../src/constants/colors";
import { useUser } from "../../src/context/UserContext";
import { useState, useRef } from "react";

const { width } = Dimensions.get("window");
const CAROUSEL_ITEM_WIDTH = width - 32;

// Blue Theme Palette (Paytm/PhonePe style)
const blueTheme = {
  primary: "#003087",
  lightBlue: "#0051BA",
  darkBlue: "#001F54",
  skyBlue: "#0066CC",
  lightSkyBlue: "#E3F2FD",
  accentBlue: "#1E88E5",
  surface: "#F8FBFF",
  white: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#D1D5DB",
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function Home() {
  const { user } = useUser();
  const [activePage, setActivePage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const loanOptions = [
    { id: 1, bank: "SBI", rate: "8.5%", amount: "₹50L", color: "#003087", icon: "🏦" },
    { id: 2, bank: "HDFC", rate: "9.0%", amount: "₹50L", color: "#0051BA", icon: "🏦" },
    { id: 3, bank: "ICICI", rate: "8.9%", amount: "₹50L", color: "#1E88E5", icon: "🏦" },
  ];

  const applications = [
    { id: 1, title: "Home Loan", amount: "₹30,00,000", status: "Under Review", statusColor: "#F59E0B" },
    { id: 2, title: "Personal Loan", amount: "₹5,00,000", status: "Approved ✅", statusColor: "#10B981" },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentPage = Math.round(contentOffsetX / CAROUSEL_ITEM_WIDTH);
    setActivePage(currentPage);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: blueTheme.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <AnimatedView
          entering={FadeInDown.duration(600)}
          style={{
            background: `linear-gradient(135deg, ${blueTheme.primary} 0%, ${blueTheme.lightBlue} 100%)`,
            backgroundColor: blueTheme.primary,
            paddingHorizontal: 20,
            paddingVertical: 24,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4, fontWeight: "500" }}>
                Welcome back
              </Text>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#FFF", letterSpacing: -0.5 }}>
                {user?.phone ? user?.phone.slice(-10) : "User"} 👋
              </Text>
            </View>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(255,255,255,0.15)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ fontSize: 28 }}>💳</Text>
            </View>
          </View>
        </AnimatedView>

        {/* Quick Stats */}
        <AnimatedView
          entering={ZoomIn.duration(800).delay(200)}
          style={{ paddingHorizontal: 16, marginBottom: 20 }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: blueTheme.white,
                padding: 16,
                borderRadius: 16,
                shadowColor: blueTheme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: blueTheme.accentBlue,
              }}
            >
              <Text style={{ fontSize: 12, color: blueTheme.subText, marginBottom: 8, fontWeight: "500" }}>Credit Score</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: blueTheme.primary }}>750</Text>
              <Text style={{ fontSize: 10, color: blueTheme.accentBlue, marginTop: 4, fontWeight: "600" }}>Good Range →</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: blueTheme.white,
                padding: 16,
                borderRadius: 16,
                shadowColor: blueTheme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: blueTheme.skyBlue,
              }}
            >
              <Text style={{ fontSize: 12, color: blueTheme.subText, marginBottom: 8, fontWeight: "500" }}>Max Amount</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: blueTheme.lightBlue }}>₹50L</Text>
              <Text style={{ fontSize: 10, color: blueTheme.skyBlue, marginTop: 4, fontWeight: "600" }}>Pre-approved ✓</Text>
            </View>
          </View>
        </AnimatedView>

        {/* Profile Completion */}
        <AnimatedView
          entering={BounceInDown.duration(900).delay(300)}
          style={{
            marginHorizontal: 16,
            marginBottom: 20,
            backgroundColor: blueTheme.white,
            padding: 16,
            borderRadius: 16,
            shadowColor: blueTheme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: blueTheme.text }}>
              Complete Your Profile
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: blueTheme.skyBlue }}>80%</Text>
          </View>

          <View
            style={{
              height: 10,
              backgroundColor: blueTheme.lightSkyBlue,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <Animated.View
              entering={BounceInDown.duration(1200)}
              style={{
                width: "80%",
                height: 10,
                backgroundColor: blueTheme.skyBlue,
                borderRadius: 10,
              }}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: blueTheme.subText, fontWeight: "500" }}>
              Unlock premium offers
            </Text>
            <Text style={{ fontSize: 18, color: blueTheme.skyBlue }}>→</Text>
          </View>
        </AnimatedView>

        {/* Main Eligibility Card */}
        <AnimatedView
          entering={ZoomIn.duration(800).delay(400)}
          style={{
            marginHorizontal: 16,
            marginBottom: 24,
            backgroundColor: blueTheme.primary,
            padding: 24,
            borderRadius: 20,
            shadowColor: blueTheme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: blueTheme.lightBlue,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "600", letterSpacing: 0.5 }}>
                YOUR ELIGIBILITY
              </Text>
              <Text style={{ fontSize: 40, fontWeight: "800", color: "#FFF", lineHeight: 44 }}>
                ₹25L
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFF" }}>New</Text>
            </View>
          </View>

          <View style={{ backgroundColor: "rgba(255,255,255,0.1)", height: 1.5, marginBottom: 16 }} />

          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 20, fontWeight: "500" }}>
            Interest from <Text style={{ fontWeight: "800", fontSize: 14 }}>8.5%</Text> p.a.
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, borderRadius: 12 }}>
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: "600" }}>Tenure</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFF" }}>2-7 Yrs</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, borderRadius: 12 }}>
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: "600" }}>Processing</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFF" }}>₹2,500</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, borderRadius: 12 }}>
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: "600" }}>Approval</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#A8D5FF" }}>24 Hrs ⚡</Text>
            </View>
          </View>
        </AnimatedView>

        {/* Loan Carousel */}
        <AnimatedView entering={FadeInDown.duration(800).delay(500)}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: blueTheme.text, marginLeft: 16, marginBottom: 16 }}>
            Popular Offers
          </Text>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            snapToInterval={CAROUSEL_ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {loanOptions.map((loan) => (
              <View key={loan.id} style={{ width: CAROUSEL_ITEM_WIDTH, paddingHorizontal: 16, justifyContent: "center" }}>
                <View
                  style={{
                    backgroundColor: loan.color,
                    borderRadius: 20,
                    padding: 24,
                    shadowColor: loan.color,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: 0.5 }}>
                        LOAN PROVIDER
                      </Text>
                      <Text style={{ fontSize: 28, fontWeight: "800", color: "#FFF", marginTop: 6 }}>
                        {loan.bank}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1.5,
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{loan.icon}</Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: "rgba(255,255,255,0.1)", height: 1.5, marginBottom: 20 }} />

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24, gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", marginBottom: 6 }}>Interest Rate</Text>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFF" }}>
                        {loan.rate}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", marginBottom: 6 }}>Max Amount</Text>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFF" }}>
                        {loan.amount}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: blueTheme.white,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Text style={{ color: loan.color, fontWeight: "800", fontSize: 15, letterSpacing: 0.3 }}>
                      APPLY NOW
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Carousel Indicators */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {loanOptions.map((_, i) => (
              <Animated.View
                key={i}
                style={{
                  width: i === activePage ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === activePage ? blueTheme.skyBlue : blueTheme.border,
                }}
              />
            ))}
          </View>
        </AnimatedView>

        {/* Applications Section */}
        <AnimatedView entering={FadeInDown.duration(800).delay(600)} style={{ marginTop: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: blueTheme.text, marginLeft: 16, marginBottom: 16 }}>
            Your Applications
          </Text>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {applications.map((app) => (
              <Animated.View
                key={app.id}
                entering={BounceInDown.delay(700)}
                style={{
                  backgroundColor: blueTheme.white,
                  padding: 16,
                  borderRadius: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  shadowColor: blueTheme.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 3,
                  borderLeftWidth: 4,
                  borderLeftColor: app.statusColor,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: blueTheme.text }}>
                    {app.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: blueTheme.subText, marginTop: 6, fontWeight: "500" }}>
                    {app.amount}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: `${app.statusColor}15`,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: app.statusColor }}>
                    {app.status}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </AnimatedView>

        {/* EMI Calculator */}
        <AnimatedView entering={FadeInDown.duration(800).delay(700)} style={{ marginTop: 28, paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: blueTheme.text, marginBottom: 16 }}>
            EMI Calculator
          </Text>

          <View
            style={{
              backgroundColor: blueTheme.white,
              padding: 16,
              borderRadius: 16,
              shadowColor: blueTheme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <TextInput
              placeholder="Enter Loan Amount"
              keyboardType="numeric"
              style={[input, { borderBottomWidth: 1, borderBottomColor: blueTheme.border }]}
              placeholderTextColor={blueTheme.subText}
            />

            <TextInput
              placeholder="Duration (Years)"
              keyboardType="numeric"
              style={input}
              placeholderTextColor={blueTheme.subText}
            />

            <TouchableOpacity
              style={{
                backgroundColor: blueTheme.skyBlue,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                shadowColor: blueTheme.skyBlue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 15, letterSpacing: 0.3 }}>
                CALCULATE EMI
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        {/* Help + Support Section */}
        <AnimatedView entering={FadeInDown.duration(800).delay(800)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: blueTheme.text, marginBottom: 16 }}>
            Help & Support
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: blueTheme.lightSkyBlue,
                borderRadius: 14,
                padding: 18,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: blueTheme.skyBlue,
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 10 }}>💬</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: blueTheme.primary }}>Chat Support</Text>
              <Text style={{ fontSize: 10, color: blueTheme.skyBlue, marginTop: 4 }}>Instant help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "rgba(1, 88, 186, 0.08)",
                borderRadius: 14,
                padding: 18,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(1, 88, 186, 0.3)",
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 10 }}>📞</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: blueTheme.primary }}>Call Advisor</Text>
              <Text style={{ fontSize: 10, color: blueTheme.skyBlue, marginTop: 4 }}>1-2 mins wait</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "rgba(1, 102, 204, 0.08)",
                borderRadius: 14,
                padding: 18,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: blueTheme.skyBlue,
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 10 }}>❓</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: blueTheme.primary }}>FAQ</Text>
              <Text style={{ fontSize: 10, color: blueTheme.skyBlue, marginTop: 4 }}>Quick answers</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const input = {
  backgroundColor: blueTheme.lightSkyBlue,
  padding: 14,
  borderRadius: 10,
  marginBottom: 12,
  fontSize: 15,
  color: blueTheme.text,
  fontWeight: "500",
};
