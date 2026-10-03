import { Ionicons } from "@expo/vector-icons";
 

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,

  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyEvents, getProfile, getUserBusinesses, updateProfile } from "../../api/api";


export default function ProfileScreen() {
  const router = useRouter();
const navigation = useNavigation<any>();

const [showProfileInfo, setShowProfileInfo] =
  useState(true);

const [showBusinesses, setShowBusinesses] =
  useState(false);

const [showEvents, setShowEvents] =
  useState(false);
  
  const [user, setUser] = useState<any>(null);

  const [businesses, setBusinesses] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [events, setEvents] =
    useState<any[]>([]);

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
      // 🔥 NEW
      const businessRes = await getUserBusinesses(u.id);
      setBusinesses(businessRes.data.data || []);

        const eventRes =  await getMyEvents(u.id);
      setEvents(eventRes.data.data || []);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const res = await updateProfile(user);

    if (res.data.status) {
      alert("Profile Updated");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) return null;

  return (

  <SafeAreaView style={styles.safe}>
  <StatusBar
    barStyle="light-content"
    backgroundColor="#0F172A"
  />

  <ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.header}>
  {/* TOP BAR */}
  <View style={styles.topBar}>
    <TouchableOpacity
      onPress={() =>
        navigation.dispatch(
          DrawerActions.openDrawer()
        )
      }
    >
      <Ionicons
        name="menu"
        size={30}
        color="#fff"
      />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.walletMini}
      onPress={() =>
        router.push("/wallet")
      }
    >
      <Ionicons
        name="wallet-outline"
        size={18}
        color="#fff"
      />

      <Text style={styles.walletMiniText}>
        Wallet
      </Text>
    </TouchableOpacity>
  </View>

  {/* PROFILE */}
  <Image
    source={{
      uri: "https://i.pravatar.cc/200?img=12",
    }}
    style={styles.avatar}
  />

  <Text style={styles.userName}>
    {user.first_name} {user.last_name}
  </Text>

  <Text style={styles.userEmail}>
    {user.email}
  </Text>

  {/* WALLET CARD */}
  <TouchableOpacity
    style={styles.walletCard}
    onPress={() => router.push("/wallet")}
    activeOpacity={0.8}
  >
    <View style={styles.walletLeft}>
      <View style={styles.walletIcon}>
        <Ionicons
          name="wallet"
          size={24}
          color="#fff"
        />
      </View>

      <View>
        <Text style={styles.walletLabel}>
          Wallet Balance
        </Text>

        <Text style={styles.walletAmount}>
          ₹290.00
        </Text>
      </View>
    </View>

    <Ionicons
      name="chevron-forward"
      size={22}
      color="#fff"
    />
  </TouchableOpacity>
</View>
    {/* PROFILE CARD */}
    <View style={styles.profileCard}>


      <TouchableOpacity
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }}
  onPress={() =>
    setShowProfileInfo(
      !showProfileInfo
    )
  }
>
  <Text style={styles.sectionHeading}>
    Personal Information
  </Text>

  <Ionicons
    name={
      showProfileInfo
        ? "chevron-up"
        : "chevron-down"
    }
    size={24}
    color="#111827"
  />
</TouchableOpacity>
{showProfileInfo && (
  <>
      <Text style={styles.label}>
        First Name
      </Text>

      <View style={styles.inputBox}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#64748B"
        />

        <TextInput
          value={user.first_name || ""}
          onChangeText={(t) =>
            setUser({
              ...user,
              first_name: t,
            })
          }
          style={styles.input}
        />
      </View>

      {/* LAST NAME */}
      <Text style={styles.label}>
        Last Name
      </Text>

      <View style={styles.inputBox}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#64748B"
        />

        <TextInput
          value={user.last_name || ""}
          onChangeText={(t) =>
            setUser({
              ...user,
              last_name: t,
            })
          }
          style={styles.input}
        />
      </View>

      {/* EMAIL */}
      <Text style={styles.label}>
        Email
      </Text>

      <View style={styles.inputBox}>
        <Ionicons
          name="mail-outline"
          size={20}
          color="#64748B"
        />

        <TextInput
          value={user.email || ""}
          editable={false}
          style={styles.input}
        />
      </View>

      {/* PHONE */}
      <Text style={styles.label}>
        Phone
      </Text>

      <View style={styles.inputBox}>
        <Ionicons
          name="call-outline"
          size={20}
          color="#64748B"
        />

        <TextInput
          value={user.phone || ""}
          onChangeText={(t) =>
            setUser({
              ...user,
              phone: t,
            })
          }
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={styles.updateBtn}
        onPress={handleUpdate}
      >
        <Text style={styles.updateBtnText}>
          Update Profile
        </Text>
      </TouchableOpacity>
      </>
      )}
    </View>

    {/* BUSINESS */}
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          My Businesses
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {businesses.length} / 3
          </Text>
        </View>
      </View>

      {businesses.map((item) => (
        <View
          key={item.provider_id}
          style={styles.businessCard}
        >
          <View style={styles.row}>
            <View
              style={styles.businessIcon}
            >
              <Ionicons
                name="business-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={styles.businessName}
              >
                {item.business_name}
              </Text>

              <Text
                style={
                  styles.businessAddress
                }
              >
                {item.address}
              </Text>
            </View>
          </View>

          <Text style={styles.status}>
            {item.status === "pending"
              ? "⏳ Pending"
              : "✅ Approved"}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.providerBtn}
        onPress={() =>
          router.push(
            "/providers/register"
          )
        }
      >
        <Text
          style={styles.providerBtnText}
        >
          Become a Provider
        </Text>
      </TouchableOpacity>
    </View>

    {/* EVENTS */}
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          My Events
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {events.length}
          </Text>
        </View>
      </View>

      {events.map((item) => (
        <View
          key={item.id}
          style={styles.eventCard}
        >
          <View style={styles.row}>
            <View
              style={styles.eventIcon}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#9333EA"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={styles.eventTitle}
              >
                {item.title}
              </Text>

              <Text
                style={styles.eventDate}
              >
                📅 {item.event_date}
              </Text>
            </View>
          </View>

          <Text style={styles.status}>
            {item.status === "pending"
              ? "⏳ Pending"
              : "✅ Approved"}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.eventBtn}
        onPress={() =>
          router.push("/events/add")
        }
      >
        <Text style={styles.eventBtnText}>
          Create Event
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
 safe: {
  flex: 1,
  backgroundColor: "#0F172A",
},

container: {
  flex: 1,
  backgroundColor: "#F1F5F9",
},

header: {
  backgroundColor: "#F97316",
  alignItems: "center",
  paddingTop: 40,
  paddingBottom: 40,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},

avatar: {
  width: 95,
  height: 95,
  borderRadius: 50,
  borderWidth: 4,
  borderColor: "#fff",
},

userName: {
  color: "#fff",
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 15,
},

userEmail: {
  color: "#CBD5E1",
  marginTop: 5,
},

profileCard: {
  backgroundColor: "#fff",
  margin: 16,
  marginTop: -25,
  borderRadius: 22,
  padding: 20,
  elevation: 4,
},

sectionHeading: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 20,
  color: "#0F172A",
},

label: {
  fontSize: 14,
  fontWeight: "600",
  color: "#475569",
  marginBottom: 8,
},

inputBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  paddingHorizontal: 14,
  marginBottom: 16,
  height: 56,
},

input: {
  flex: 1,
  marginLeft: 10,
  fontSize: 15,
  color: "#0F172A",
},

updateBtn: {
  backgroundColor: "#2563EB",
  height: 56,
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
},

updateBtnText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},

sectionCard: {
  backgroundColor: "#fff",
  marginHorizontal: 16,
  marginBottom: 18,
  borderRadius: 22,
  padding: 18,
  elevation: 3,
},

sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
},

sectionTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#0F172A",
},

badge: {
  backgroundColor: "#DBEAFE",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

badgeText: {
  color: "#2563EB",
  fontWeight: "bold",
},

businessCard: {
  backgroundColor: "#F8FAFC",
  borderRadius: 18,
  padding: 15,
  marginBottom: 14,
},

eventCard: {
  backgroundColor: "#F8FAFC",
  borderRadius: 18,
  padding: 15,
  marginBottom: 14,
},

row: {
  flexDirection: "row",
},

businessIcon: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: "#DBEAFE",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

eventIcon: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: "#F3E8FF",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

businessName: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#111827",
},

businessAddress: {
  color: "#64748B",
  marginTop: 5,
},

eventTitle: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#111827",
},

eventDate: {
  color: "#64748B",
  marginTop: 5,
},

status: {
  marginTop: 12,
  fontWeight: "700",
  color: "#F59E0B",
},

providerBtn: {
  backgroundColor: "#2563EB",
  padding: 16,
  borderRadius: 16,
  alignItems: "center",
  marginTop: 10,
},

providerBtnText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 15,
},

eventBtn: {
  backgroundColor: "#9333EA",
  padding: 16,
  borderRadius: 16,
  alignItems: "center",
  marginTop: 10,
},

eventBtnText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 15,
},

center: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F1F5F9",
},

topBar: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 18,
  marginBottom: 25,
},

walletMini: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.15)",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
},

walletMiniText: {
  color: "#fff",
  marginLeft: 6,
  fontWeight: "600",
},

walletCard: {
  backgroundColor: "rgba(255,255,255,0.12)",
  width: "90%",
  marginTop: 22,
  borderRadius: 18,
  padding: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

walletLeft: {
  flexDirection: "row",
  alignItems: "center",
},

walletIcon: {
  width: 48,
  height: 48,
  borderRadius: 14,
  backgroundColor: "rgba(255,255,255,0.18)",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

walletLabel: {
  color: "#CBD5E1",
  fontSize: 13,
},

walletAmount: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
  marginTop: 3,
},
});