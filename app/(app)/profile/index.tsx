import { eventBus } from "@/utils/events";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getMyEvents, getProfile, getUserBusinesses, getWallet, logoutUser, updateProfile, deleteUserAccount } from "../../api/api";

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [showProfileInfo, setShowProfileInfo] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showBusinesses, setShowBusinesses] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [businessesCount, setBusinessesCount] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [eventsCount, setEventsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const u = JSON.parse((await AsyncStorage.getItem("user")) || "{}");

      if (!u?.id) {
        router.replace("/(auth)/login");
        return;
      }

      const res = await getProfile(u.id);
      setUser(res.data.data);

      const businessRes = await getUserBusinesses(u.id);
      setBusinessesCount(businessRes.data.data || []); 

      const eventRes = await getMyEvents(u.id);
      setEventsCount(eventRes.data.data?.length || 0);

      const walletRes = await getWallet(u.id);
      setWalletBalance(walletRes.data.data?.balance || 0);
    } catch (e) {
      console.log("Profile load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const res = await updateProfile(user);
    if (res.data.status) {
      alert("Profile Updated successfully ✨");
      eventBus.emit("walletUpdated"); 
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.log("Logout API error:", e);
    } finally {
      await AsyncStorage.clear();
      router.replace("/(auth)/login");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete / Deactivate Account",
      "Are you sure you want to deactivate your account?\n\n• Your account will be disabled immediately.\n• All data is retained safely for a 30-day grace period.\n• If not restored within 30 days, your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate Account",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?.email) {
                Alert.alert("Error", "No email associated with your account.");
                return;
              }
              const res = await deleteUserAccount({ email: user.email });
              if (res.data?.status) {
                Alert.alert(
                  "Account Deactivated",
                  "Your account has been disabled. It will be permanently removed after 30 days. You can restore it anytime before that.",
                  [
                    {
                      text: "OK",
                      onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace("/(auth)/login");
                      }
                    }
                  ]
                );
              } else {
                Alert.alert("Error", res.data?.message || "Failed to deactivate account.");
              }
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to process request.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B38FB" />
      </View>
    );
  }

  if (!user) return null;

  const isListingPartner = user?.is_partner === 1 || user?.is_provider === 1;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* प्रीमियम रॉयल थीम ग्रेडिएंट हेडर */}
        <LinearGradient
          colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={styles.header}
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconBtn}>
              <Ionicons name="menu" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.walletMini} onPress={() => router.push("/wallet")}>
              <View style={styles.miniIconWrapper}>
                <Ionicons name="wallet" size={12} color="#6B38FB" />
              </View>
              <Text style={styles.walletMiniText}>Credit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileMeta}>
            <Image source={{ uri: "https://i.pravatar.cc/200?img=12" }} style={styles.avatar} />
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* वॉलेट कार्ड */}
          <TouchableOpacity style={styles.walletCard} onPress={() => router.push("/wallet")} activeOpacity={0.9}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={20} color="#6B38FB" />
              </View>
              <View>
                <Text style={styles.walletLabel}>AVAILABLE CREDIT</Text>
                <Text style={styles.walletAmount}>🪙 {Number(walletBalance).toFixed(2)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.contentBody}>
          {/* PERSONAL INFORMATION */}
              <View style={styles.sectionCard}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowProfileInfo(!showProfileInfo)} activeOpacity={0.7}>
                  <Text style={styles.sectionHeading}>Personal Information</Text>
                  <Ionicons name={showProfileInfo ? "chevron-up" : "chevron-down"} size={20} color="#1E293B" />
                </TouchableOpacity>

                {showProfileInfo && (
                  <View style={styles.sectionContent}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="person-outline" size={18} color="#64748B" />
                      <TextInput
                        value={user.first_name || ""}
                        onChangeText={(t) => setUser({ ...user, first_name: t })}
                        style={styles.input}
                        placeholder="Enter first name"
                      />
                    </View>

                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="person-outline" size={18} color="#64748B" />
                      <TextInput
                        value={user.last_name || ""}
                        onChangeText={(t) => setUser({ ...user, last_name: t })}
                        style={styles.input}
                        placeholder="Enter last name"
                      />
                    </View>

                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputBox, styles.disabledInput]}>
                      <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                      <TextInput value={user.email || ""} editable={false} style={[styles.input, { color: "#94A3B8" }]} />
                    </View>

                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="call-outline" size={18} color="#64748B" />
                      <TextInput
                        value={user.phone || ""}
                        onChangeText={(t) => setUser({ ...user, phone: t })}
                        style={styles.input}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                      />
                    </View>

                    {/* Claim Business Button */}
                    <TouchableOpacity 
                      style={styles.claimBusinessBtn} 
                      onPress={() => {
                        if (!user?.phone || user.phone.trim() === "") {
                          alert("Please update your phone number in your profile first! ⚠️");
                        } else {
                          router.push({
                            pathname: "/profile/claim-business",
                            params: { userPhone: user.phone }
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
                      <Text style={styles.claimBusinessBtnText}>Claim My Listed Business</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} activeOpacity={0.8}>
                      <Text style={styles.updateBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
          {/* CONDITION 1: IF USER IS LISTING PARTNER */}
          {isListingPartner ? (
            <View style={styles.partnerAlertCard}>
              <View style={styles.partnerAlertHeader}>
                <Ionicons name="briefcase" size={22} color="#6B38FB" />
                <Text style={styles.partnerAlertTitle}>Listing Partner Dashboard</Text>
              </View>
              <Text style={styles.partnerAlertDesc}>
                You are a registered Listing Partner. Please proceed to your main panel to manage your businesses, earnings, and listings seamlessly.
              </Text>
              <TouchableOpacity 
                style={styles.goToPartnerBtn} 
                onPress={() => router.push("/partner")} 
                activeOpacity={0.8}
              >
                <Text style={styles.goToPartnerBtnText}>Go to Partner Dashboard</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            /* CONDITION 2: IF NORMAL USER */
            <>
              

              {/* MY BUSINESSES SECTION */}
              <View style={styles.sectionCard}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowBusinesses(!showBusinesses)} activeOpacity={0.7}>
                  <View style={styles.titleRow}>
                    <Text style={styles.sectionHeading}>My Businesses</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{businessesCount?.length || 0} / 3</Text>
                    </View>
                  </View>
                  <Ionicons name={showBusinesses ? "chevron-up" : "chevron-down"} size={20} color="#1E293B" />
                </TouchableOpacity>

                {showBusinesses && (
                  <View style={styles.sectionContent}>
                    <TouchableOpacity style={styles.providerBtn} onPress={() => router.push("/providers/register")} activeOpacity={0.8}>
                      <Ionicons name="add-circle-outline" size={20} color="#6B38FB" />
                      <Text style={styles.providerBtnText}>Become a Provider</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {/* MY EVENTS SECTION */}
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowEvents(!showEvents)} activeOpacity={0.7}>
              <View style={styles.titleRow}>
                <Text style={styles.sectionHeading}>My Events</Text>
                <View style={[styles.badge, { backgroundColor: "#F3E8FF" }]}>
                  <Text style={[styles.badgeText, { color: "#6B38FB" }]}>{eventsCount}</Text>
                </View>
              </View>
              <Ionicons name={showEvents ? "chevron-up" : "chevron-down"} size={20} color="#1E293B" />
            </TouchableOpacity>

            {showEvents && (
              <View style={styles.sectionContent}>
                <TouchableOpacity 
                  style={styles.viewEventsListBtn} 
                  onPress={() => router.push("/profile/my-events-list")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={18} color="#6B38FB" />
                  <Text style={styles.viewEventsListBtnText}>View Full Event List</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.eventBtn} onPress={() => router.push("/events/add")} activeOpacity={0.8}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.eventBtnText}>Create New Event</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>

          {/* DELETE ACCOUNT BUTTON */}
          <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={18} color="#991B1B" />
            <Text style={styles.deleteAccountText}>Delete Account (30-Day Safe Grace)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  
  header: { 
    paddingTop: Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
    paddingBottom: 50, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    alignItems: "center", 
    paddingHorizontal: 16 
  },
  topBar: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  iconBtn: { padding: 4 },
  
  walletMini: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255,255,255,0.25)", 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.3)"
  },
  miniIconWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  walletMiniText: { color: "#fff", marginLeft: 6, fontWeight: "700", fontSize: 12 },
  
  profileMeta: { alignItems: "center", marginBottom: 25 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  userName: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 12, letterSpacing: 0.3 },
  userEmail: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 },
  
  walletCard: { 
    backgroundColor: "#fff", 
    width: "100%", 
    borderRadius: 20, 
    padding: 14, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    shadowColor: "#6B38FB", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 10, 
    elevation: 6, 
    position: "absolute", 
    bottom: -28,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  walletLeft: { flexDirection: "row", alignItems: "center" },
  walletIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  walletLabel: { color: "#94A3B8", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  walletAmount: { color: "#1E293B", fontSize: 18, fontWeight: "800", marginTop: 1 },
  
  contentBody: { paddingHorizontal: 16, paddingTop: 45, paddingBottom: 30 },
  sectionCard: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: "#F1F5F9", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center" },
  sectionHeading: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  sectionContent: { marginTop: 16 },
  
  badge: { backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginLeft: 8, borderWidth: 0.5, borderColor: "#E9D5FF" },
  badgeText: { color: "#6B38FB", fontWeight: "700", fontSize: 11 },
  
  label: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, height: 48 },
  disabledInput: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: "#1E293B", fontWeight: "600" },
  
  providerBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#6B38FB", borderStyle: "dashed", padding: 14, borderRadius: 12, backgroundColor: "#EEF2FF" },
  providerBtnText: { color: "#6B38FB", fontWeight: "700", fontSize: 14, marginLeft: 6 },
  
  viewEventsListBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#F3E8FF", borderWidth: 1, borderColor: "#E9D5FF", padding: 12, borderRadius: 12, marginBottom: 10 },
  viewEventsListBtnText: { color: "#6B38FB", fontWeight: "700", fontSize: 13, marginLeft: 6 },
  
  eventBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#6B38FB", padding: 14, borderRadius: 12 },
  eventBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
  
  logoutBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FEE2E2", padding: 14, borderRadius: 16, marginTop: 10, marginBottom: 8 },
  logoutText: { color: "#EF4444", fontSize: 14, fontWeight: "700", marginLeft: 8 },
  
  deleteAccountBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FFE4E6", padding: 12, borderRadius: 16, marginBottom: 20 },
  deleteAccountText: { color: "#BE123C", fontSize: 12, fontWeight: "700", marginLeft: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  
  claimBusinessBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0", borderStyle: "dashed", padding: 12, borderRadius: 12, marginBottom: 14 },
  claimBusinessBtnText: { color: "#065F46", fontWeight: "700", fontSize: 13, marginLeft: 6 },
  
  updateBtn: { backgroundColor: "#6B38FB", height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 4 },
  updateBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  
  // PARTNER CARD STYLES
  partnerAlertCard: { backgroundColor: "#EEF2FF", borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E9D5FF', shadowColor: "#6B38FB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  partnerAlertHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  partnerAlertTitle: { fontSize: 16, fontWeight: "800", color: "#5B21B6" },
  partnerAlertDesc: { fontSize: 13, color: "#4C1D95", lineHeight: 18, fontWeight: "500", marginBottom: 14 },
  goToPartnerBtn: { backgroundColor: "#6B38FB", height: 44, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  goToPartnerBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" }
});