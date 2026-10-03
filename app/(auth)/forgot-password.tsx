import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { forgotPassword } from "../api/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword({ email });

      if (res.data.status) {
        Alert.alert("Success", "OTP has been sent to your email.");
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email },
        });
      } else {
        Alert.alert("Error", res.data.message || "Failed to send OTP.");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
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
          
          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🔐</Text>
            </View>
            <Text style={styles.brandName}>SECURITY</Text>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address below to receive your OTP code
            </Text>
          </View>

          {/* Sky Blue Card Container */}
          <View style={styles.card}>
            {/* Email Input Field */}
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#0284C7"
                style={styles.icon}
              />
              <TextInput
                placeholder="name@sky.com"
                placeholderTextColor="#7DD3FC"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Action Button with Loading Indicator */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send OTP Code</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backToLoginContainer}
              disabled={loading}
            >
              <View style={styles.backToLoginContent}>
                <Ionicons name="arrow-back-outline" size={16} color="#0284C7" style={styles.backIcon} />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </View>
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
    backgroundColor: "#E0F2FE", // Match dynamic Sky Blue background
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
    backgroundColor: "#BAE6FD", // Subtle darker sky bubble for icon
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
    color: "#0C4A6E", // Contrast Oceanic Blue text
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
  card: {
    backgroundColor: "#F0F9FF", // Ice/Frost Blue container
    borderRadius: 32,
    padding: 26,
    marginHorizontal: 20,
    shadowColor: "#0284C7", // Aesthetic colored glow shadow
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
    backgroundColor: "#FFFFFF", // Crisp white input component
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#B9E6FE",
    paddingHorizontal: 16,
    marginBottom: 24,
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
  button: {
    backgroundColor: "#0284C7", // Vibrant Ocean Blue main button
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#7DD3FC", // Light color when API is working
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    marginTop: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  backToLoginContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 6,
  },
  backToLoginText: {
    color: "#0284C7",
    fontSize: 15,
    fontWeight: "700",
  },
});