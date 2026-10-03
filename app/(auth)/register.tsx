import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { googleLoginUser, registerUser } from "../api/api";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // 🌟 Accordion ओपन/क्लोज करने के लिए स्टेट
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "18877084295-371asi0j4habfre4r992hti1ivlhvnj3.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleRegister = async () => {
    if (!firstName || !email || !phone || !password) {
      Alert.alert("Required Fields", "Please fill in all mandatory fields to create an account.");
      return;
    }
    try {
      setLoading(true);
      const res = await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });

      if (res.data.status) {
        Alert.alert("Success 🎉", "Account created successfully! Please login.");
        router.push("/login");
      } else {
        Alert.alert("Registration Failed", res.data.message || "Failed to register user.");
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
      }

      const userInfo: any = await GoogleSignin.signIn();
      const googleUserData = userInfo.data ? userInfo.data.user : userInfo.user;

      if (!googleUserData) throw new Error("Google user data not found");

      const res = await googleLoginUser({
        google_id: googleUserData.id,
        email: googleUserData.email,
        first_name: googleUserData.givenName || "GoogleUser",
        last_name: googleUserData.familyName || "",
      });

      if (res.data.status) {
        await AsyncStorage.setItem("user", JSON.stringify(res.data.data));
        if (res.data.token) {
          await AsyncStorage.setItem("user_token", res.data.token);
        }
        Alert.alert("Success 🎉", "Logged in via Google successfully!", [
          { text: "OK", onPress: () => router.replace("/(app)/(tabs)") }
        ]);
      } else {
        Alert.alert("Login Failed", res.data.message || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Google Error", error.message || "Unable to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🌅 Curved Header */}
        <LinearGradient
          colors={["#0052D4", "#4364F7", "#6FB1FC", "#FF6B00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topSection}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="location" size={40} color="#FF6B00" />
          </View>
          <Text style={styles.brandName}>NEARBY ME</Text>
          <Text style={styles.brandSubtitle}>Find • Connect • Earn</Text>
          <Text style={styles.subtitle}>Discover local businesses & services around you.</Text>
        </LinearGradient>

        {/* 📋 Main Card */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Join 50,000+ users near you</Text>

            {/* 🔴 GMAIL AUTH BUTTON (अब यह सबसे ऊपर रहेगा ताकि यूज़र को तुरंत दिखे) */}
            <TouchableOpacity 
              style={[styles.googleButton, loading && { opacity: 0.7 }]} 
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading && !isEmailFormOpen ? (
                <ActivityIndicator color="#0056B3" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* --- SEPARATOR LINE --- */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 🎯 ACCORDION TOGGLE BUTTON (Custom Email Option) */}
            <TouchableOpacity 
              style={styles.accordionHeader} 
              onPress={() => setIsEmailFormOpen(!isEmailFormOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.accordionHeaderTextContainer}>
                <Ionicons name="mail-outline" size={20} color="#4364F7" style={{ marginRight: 10 }} />
                <Text style={styles.accordionTitle}>Sign up with Email & Password</Text>
              </View>
              <Ionicons 
                name={isEmailFormOpen ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#64748B" 
              />
            </TouchableOpacity>

            {/* 🪗 ACCORDION CONTENT (यह सिर्फ तब खुलेगा जब isEmailFormOpen true होगा) */}
            {isEmailFormOpen && (
              <View style={styles.accordionContent}>
                
                {/* First Name */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#4364F7" style={styles.icon} />
                  <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#94A3B8"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                    editable={!loading}
                  />
                  <Text style={styles.requiredStar}>*</Text>
                </View>

                {/* Last Name */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#4364F7" style={styles.icon} />
                  <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#94A3B8"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                    editable={!loading}
                  />
                </View>

                {/* Email */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#4364F7" style={styles.icon} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <Text style={styles.requiredStar}>*</Text>
                </View>

                {/* Phone */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#4364F7" style={styles.icon} />
                  <TextInput
                    placeholder="Phone Number"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!loading}
                  />
                  <Text style={styles.requiredStar}>*</Text>
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#4364F7" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secure}
                    style={styles.input}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <Text style={styles.requiredStar}>*</Text>
                  <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon} disabled={loading}>
                    <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* 🚀 GRADIENT REGISTER BUTTON */}
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
                  <LinearGradient
                    colors={["#4364F7", "#FF6B00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.buttonText}>Create Account</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Login Link */}
            <TouchableOpacity onPress={() => !loading && router.push("/login")} style={styles.loginLinkContainer}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkBold}>Sign In </Text>
                <Ionicons name="arrow-forward-outline" size={13} color="#4364F7" />
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FE",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topSection: {
    paddingTop: 60,
    paddingBottom: 110,
    alignItems: "center",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: -80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 52,
  },
  accordionHeaderTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  accordionContent: {
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  requiredStar: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  buttonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },
  loginLinkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  linkBold: {
    color: "#4364F7",
    fontWeight: "700",
  },
});