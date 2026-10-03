import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,

  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "../api/api";
export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const handleReset = async () => {
    if (!otp || !password) {
      Alert.alert("Required Fields", "Please enter both the OTP code and your new password.");
      return;
    }

    try {
      const res = await resetPassword({
        email,
        otp,
        password,
      });

      if (res.data.status) {
        Alert.alert("Success 🎉", "Your password has been reset successfully.");
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Verification Failed", res.data.message || "Invalid OTP code.");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TOP SECTION */}
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🔑</Text>
            </View>
            <Text style={styles.brandName}>VERIFICATION</Text>
            <Text style={styles.title}>Verify OTP</Text>
            {email ? (
              <Text style={styles.subtitle}>
                We've sent a security code to{"\n"}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
            ) : (
              <Text style={styles.subtitle}>
                Enter the verification code sent to your email address
              </Text>
            )}
          </View>

          {/* SKY BLUE CARD CONTAINER */}
          <View style={styles.card}>
            
            {/* OTP Code Input */}
            <Text style={styles.inputLabel}>Secure OTP Code</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="key-outline"
                size={22}
                color="#0284C7"
                style={styles.icon}
              />
              <TextInput
                placeholder="Enter Code"
                placeholderTextColor="#7DD3FC"
                value={otp}
                // Sirf numbers (0-9) allow honge aur text selection validation hard functional rahegi
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            {/* New Password Input */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#0284C7"
                style={styles.icon}
              />
              <TextInput
                placeholder="Create new password"
                placeholderTextColor="#7DD3FC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                style={styles.input}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#0284C7"
                />
              </TouchableOpacity>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleReset}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backLinkContainer}
            >
              <Text style={styles.link}>
                Didn't receive code? <Text style={styles.linkBold}>Resend</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E0F2FE", // Premium Light Sky Blue Canvas
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  topSection: {
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  logoContainer: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "#BAE6FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoIcon: {
    fontSize: 42,
  },
  brandName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0369A1",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0C4A6E", // Oceanic Navy text contrast
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#0369A1",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "85%",
  },
  emailHighlight: {
    fontWeight: "700",
    color: "#0284C7",
  },
  card: {
    backgroundColor: "#F0F9FF", // Ice Frost clean background card
    borderRadius: 32,
    padding: 26,
    marginHorizontal: 20,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#E0F2FE",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0369A1",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Crisp white input panels
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#B9E6FE",
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0C4A6E",
    fontWeight: "600",
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: "#0284C7", // Bright solid primary blue action button
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backLinkContainer: {
    marginTop: 24,
  },
  link: {
    textAlign: "center",
    color: "#0369A1",
    fontSize: 14,
    fontWeight: "500",
  },
  linkBold: {
    color: "#0284C7",
    fontWeight: "700",
  },
});