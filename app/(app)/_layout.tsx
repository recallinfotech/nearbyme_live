import { eventBus } from "@/utils/events";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWallet, logoutUser } from "../api/api";

function CustomMenu() {
  const [balance, setBalance] = useState(0);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadWallet();
    loadUser();
    eventBus.on("walletUpdated", loadWallet);

    return () => {
      eventBus.off("walletUpdated", loadWallet);
    };
  }, []);

  const loadUser = async () => {
    const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
    setUserData(user);
  };

  const loadWallet = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      const res = await getWallet(user.id);
      const wallet = res.data?.data;
      setBalance(wallet?.balance ?? 0);
    } catch (e) {
      console.log(e);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.log("Logout API error:", e);
    } finally {
      await AsyncStorage.clear();
      router.replace("/(auth)/login");
    }
  };

  const MenuItem = ({ title, icon, onPress, danger = false, iconBg = "#EFF6FF" }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.dangerMenuItem]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: danger ? "#FEF2F2" : iconBg }]}>
        {icon}
      </View>
      <Text style={[styles.menuText, danger && styles.menuTextDanger]}>
        {title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={14}
        color={danger ? "#EF4444" : "#1E293B"}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 🔮 TOP GRADIENT HEADER - DIRECT BOUND TO BORDERS */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#FF7E40']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Help / Question Icon Badge */}
        <View style={styles.crownContainer}>
          <Ionicons name="help-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
        </View>

        <View style={styles.profileRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {userData?.first_name || "Guest"} {userData?.last_name || ""}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {userData?.email || "guest@user.com"}
            </Text>
          </View>
        </View>

        {/* 💵 Floating Balance Component Container */}
        <View style={styles.balanceCard}>
          <View style={styles.walletLeftBox}>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={16} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balance}>🪙{Number(balance).toFixed(2)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.rechargeBadge}
            onPress={() => router.push("/wallet")}
            activeOpacity={0.8}
          >
            <Text style={styles.rechargeText}>Add Credits</Text>
            <Ionicons name="arrow-forward" size={11} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🧭 NAVIGATION SCROLL BODY */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Navigation Menu</Text>

          <MenuItem
            title="Home"
            onPress={() => router.push("/")}
            icon={<Ionicons name="home" size={16} color="#4F46E5" />}
            iconBg="#EEF2FF"
          />

          <MenuItem
            title="Profile"
            onPress={() => router.push("/profile")}
            icon={<Ionicons name="person" size={16} color="#0EA5E9" />}
            iconBg="#F0F9FF"
          />

          <MenuItem
            title="My Phonebook"
            onPress={() => router.push("/profile/my-phonebook")}
            icon={<Ionicons name="book" size={16} color="#10B981" />}
            iconBg="#ECFDF5"
          />

          {/* 🔥 NEW OPTION 1: EMERGENCY PHONEBOOK */}
         

          <MenuItem
            title="Partner Dashboard"
            onPress={() => router.push("/partner")}
            icon={<Ionicons name="people" size={16} color="#F59E0B" />}
            iconBg="#FEF3C7"
          />

          <MenuItem
            title="Search Services / Business"
            onPress={() => router.push("/categories")}
            icon={<Ionicons name="search" size={16} color="#6366F1" />}
            iconBg="#EEF2FF"
          />

          <MenuItem
            title="Events"
            onPress={() => router.push("/events")}
            icon={<Ionicons name="calendar" size={16} color="#EC4899" />}
            iconBg="#FDF2F8"
          />

          <MenuItem
            title="Credit Wallet"
            onPress={() => router.push("/wallet")}
            icon={<Ionicons name="wallet" size={16} color="#3B82F6" />}
            iconBg="#EFF6FF"
          />

          <View style={styles.divider} />

           <MenuItem
            title="Emergency Phonebook"
            onPress={() => router.push("/emergency-phonebook")}
            icon={<Ionicons name="alert-circle" size={16} color="#EF4444" />}
            iconBg="#FEE2E2"
          />

          {/* 🔥 NEW OPTION 2: AGRA CITY OFFICERS DIRECTORY */}
          <MenuItem
            title="Agra Officers Directory"
            onPress={() => router.push("/officers-phonebook")}
            icon={<Ionicons name="business" size={16} color="#1E3A8A" />}
            iconBg="#EFF6FF"
          />

          <View style={styles.divider} />

          <MenuItem
            title="Logout"
            onPress={logout}
            danger
            icon={<Ionicons name="log-out" size={16} color="#EF4444" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 295,
          backgroundColor: "#FFFFFF",
        },
      }}
      drawerContent={() => <CustomMenu />}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 20 : 35, 
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden'
  },
  crownContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 20 : 35, right: 16, backgroundColor: 'rgba(255,255,255,0.15)', padding: 5, borderRadius: 10 },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 52, height: 54, borderRadius: 27, borderWidth: 2, borderColor: "#FFFFFF" },
  profileInfo: { flex: 1, marginLeft: 12 },
  name: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.1 },
  email: { color: "rgba(255, 255, 255, 0.8)", fontSize: 12, marginTop: 1, fontWeight: "500" },
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.22)", 
    padding: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  walletLeftBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  balanceLabel: { color: "rgba(255, 255, 255, 0.75)", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  balance: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  rechargeBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rechargeText: { color: "#4F46E5", fontSize: 11, fontWeight: "800" },
  menuScroll: { flex: 1 },
  menuContainer: { paddingHorizontal: 14, paddingTop: 14 },
  menuTitle: { fontSize: 11, fontWeight: "800", color: "#94A3B8", marginBottom: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
  menuItem: { flexDirection: "row", alignItems: "center", backgroundColor: '#FAFAFA', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, marginBottom: 5, borderWidth: 1, borderColor: '#F4F4F5' },
  dangerMenuItem: { marginTop: 4 },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuText: { fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1 },
  menuTextDanger: { color: "#EF4444" },
  arrowIcon: { opacity: 0.8 },
  divider: { height: 1, backgroundColor: "#F4F4F5", marginVertical: 8 }
});