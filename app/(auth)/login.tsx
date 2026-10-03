import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin"; // 👈 GoogleSignin इम्पोर्ट किया
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react"; // 👈 useEffect जोड़ा
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
import { googleLoginUser, loginUser } from "../api/api"; // 👈 googleLoginUser API इम्पोर्ट की

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🌟 Google Sign-In कॉन्फ़िगरेशन
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "18877084295-371asi0j4habfre4r992hti1ivlhvnj3.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  // 🛠️ मैन्युअल ईमेल/पासवर्ड लॉगिन
 // 🛠️ मैन्युअल ईमेल/पासवर्ड लॉगिन
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      const apiResponse = res.data; 

      if (apiResponse.status === true || apiResponse.status === "true" || apiResponse.status === 1) {
        await AsyncStorage.setItem("user", JSON.stringify(apiResponse.data));
        
        if (apiResponse.token) {
          await AsyncStorage.setItem("user_token", apiResponse.token);
        }
        
        // 🌟 यूज़र का नाम निकालने के लिए (अगर first_name न मिले तो 'User' दिखाएगा)
        const userName = apiResponse.data?.first_name || apiResponse.data?.name || "User";

        // 🎉 कस्टमाइज़्ड अलर्ट मैसेज
        Alert.alert(
          "Success 🎉", 
          `Hello ${userName}, Welcome to Nearby me, Explore your service around you`, 
          [
            {
              text: "OK",
              onPress: () => router.replace("/(app)/(tabs)")
            }
          ]
        );
      } else {
        Alert.alert("Error", apiResponse.message || "Invalid Login");
      }
    } catch (e: any) {
      console.log("Login Error: ", e);
      const errorMsg = e.response?.data?.message || "Something went wrong";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };
  // 🔴 GOOGLE LOGIN HANDLER (Register Screen जैसा ही सेम लॉजिक)
 // 🔴 GOOGLE LOGIN HANDLER
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

        // 🌟 बैकएंड रिस्पॉन्स या सीधे गूगल डेटा से नाम निकालना
        const userName = res.data.data?.first_name || googleUserData.givenName || "User";

        // 🎉 कस्टमाइज़्ड अलर्ट मैसेज
        Alert.alert(
          "Success 🎉", 
          `Hello ${userName}, Welcome to Nearby me 🚀\n Let's explore incredible services around you!`, 
          [
            { text: "OK", onPress: () => router.replace("/(app)/(tabs)") }
          ]
        );
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
        
        {/* 🌅 Curved Gradient Header */}
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
          <Text style={styles.subtitle}>Login to continue your futuristic journey</Text>
        </LinearGradient>

        {/* 📋 Overlapping Input Card */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your account</Text>

            {/* 🔴 GMAIL AUTH BUTTON */}
            <TouchableOpacity 
              style={[styles.googleButton, loading && { opacity: 0.7 }]} 
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
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

            {/* Email Field */}
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
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Field */}
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
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon} disabled={loading}>
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => !loading && router.push("/(auth)/forgot-password")}
              style={styles.forgotContainer}
              disabled={loading}
            >
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* 🚀 Gradient Login Button */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
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
                    <Text style={styles.buttonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => !loading && router.push("/(auth)/register")}
              style={styles.registerContainer}
              disabled={loading}
            >
              <Text style={styles.link}>
                Don’t have an account? <Text style={styles.linkBold}>Register</Text>
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
    marginBottom: 20, // 👈 24 से कम करके 20 किया ताकि गूगल बटन से स्पेसिंग सही रहे
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    marginBottom: 16,
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
  eyeIcon: {
    padding: 4,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgot: {
    color: "#4364F7",
    fontWeight: "700",
    fontSize: 14,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
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
  registerContainer: {
    marginTop: 24,
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
  // 🌟 Google Button & Divider Styles (Register Screen से सिंक किए हुए)
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
});