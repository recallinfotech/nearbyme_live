import { eventBus } from "@/utils/events";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  ActivityIndicator,
  Alert, Image, Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProviderDetail, getWallet, unlockProvider } from "../../api/api";

export default function ProviderDetail() {
  const [walletBalance, setWalletBalance] = useState(0);
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { id } = useLocalSearchParams();

  const [data, setData] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const loadWallet = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (user?.id) {
        const walletRes = await getWallet(user.id);
        setWalletBalance(walletRes.data.data?.balance || 0);
      }
    } catch (e) {
      console.log("Wallet Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadWallet();
    }, [])
  );

  useEffect(() => {
    const refreshWallet = () => {
      loadWallet();
    };
    eventBus.on("walletUpdated", refreshWallet);
    return () => {
      eventBus.off("walletUpdated", refreshWallet);
    };
  }, []);

  const loadData = async () => {
    const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
    const res = await getProviderDetail(id, user.id);
    setData(res.data.data);
    setIsUnlocked(res.data.data.is_unlocked);
  };

  const handleUnlock = async () => {
    const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
    const walletRes = await getWallet(user.id);
    const balance = walletRes.data?.data?.balance ?? 0;

    if (balance <= 0) {
      if (Platform.OS === "web") {
        const confirm = window.confirm("Wallet empty hai. Recharge kare?");
        if (confirm) {
          router.push({
            pathname: "/wallet",
            params: { from: "provider", provider_id: id },
          });
        }
      } else {
        Alert.alert("Wallet Empty 💰", "Recharge kare?", [
          { text: "Cancel" },
          {
            text: "Recharge",
            onPress: () =>
              router.push({
                pathname: "/wallet",
                params: { from: "provider", provider_id: id },
              }),
          },
        ]);
      }
      return;
    }

    const res = await unlockProvider({
      user_id: user.id,
      provider_id: id,
    });

    if (!res.data.status) {
      alert(res.data.message);
      return;
    }

    setIsUnlocked(true);
    await loadWallet();
    eventBus.emit("walletUpdated");
    alert(res.data.message);
  };

  const handleCall = () => {
    if (!isUnlocked) {
      alert("Please unlock first");
      return;
    }
    Linking.openURL(`tel:${data.phone}`);
  };

  const handleWhatsApp = () => {
    if (!isUnlocked) {
      alert("Please unlock first");
      return;
    }
    const phone = data.phone.startsWith("91") ? data.phone : `91${data.phone}`;
    Linking.openURL(`https://wa.me/${phone}`);
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B38FB" />
        <Text style={styles.loadingText}>Fetching details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {data.category_name || "Details"}
        </Text>

        <TouchableOpacity onPress={() => router.push("/wallet")} style={styles.walletBox}>
          <Text style={styles.walletText}>₹{walletBalance}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* BANNER WITH REFINED SHADOW */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{
              uri: data.banner_image || "https://via.placeholder.com/400",
            }}
            style={styles.banner}
            blurRadius={isUnlocked ? 0 : 18}
          />

          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={32} color="#fff" />
              <Text style={styles.lockOverlayText}>Unlock to View Banner</Text>
            </View>
          )}
          <View style={styles.overlay} />
        </View>

        {/* PROFILE CARD - 🌟 RATING REMOVED */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: data.icon_url || "https://cdn-icons-png.flaticon.com/512/869/869636.png",
            }}
            style={styles.icon}
          />
          <Text style={styles.name}>{data.business_name}</Text>
        </View>

        {/* DETAILS SECTION CARDS */}
        <View style={styles.cardsBlockContainer}>
          
          {/* ADDRESS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color="#6B38FB" />
              <Text style={styles.label}>Address</Text>
            </View>
            <Text style={styles.value}>{data.address || 'No Address Provided'}</Text>
          </View>

          {/* PHONE */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={20} color="#16A34A" />
              <Text style={styles.label}>Phone Number</Text>
            </View>
            <Text style={styles.phone}>
              {isUnlocked
                ? data.phone
                : data.phone
                ? data.phone.substring(0, 3) + "XXXXXXX"
                : "Hidden"}
            </Text>
            {!isUnlocked && (
              <Text style={styles.lockText}>🔒 Unlock to view full contact</Text>
            )}
          </View>

          {/* EMAIL */}
          {data.email ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail" size={20} color="#5B21B6" />
                <Text style={styles.label}>Email Address</Text>
              </View>
              <Text style={styles.value}>{data.email}</Text>
            </View>
          ) : null}

          {/* VERIFICATION STATUS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
              <Text style={styles.label}>Verification Status</Text>
            </View>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: data.is_verified == 1 ? "#DCFCE7" : "#FEE2E2" },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: data.is_verified == 1 ? "#15803D" : "#DC2626" },
                  ]}
                >
                  {data.is_verified == 1 ? "Verified Provider ✓" : "Not Verified"}
                </Text>
              </View>
            </View>
          </View>

          {/* WORKING HOURS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={20} color="#6B38FB" />
              <Text style={styles.label}>Working Hours</Text>
            </View>

            {data.is_24x7_available == 1 ? (
              <View style={styles.twentyFourBox}>
                <Ionicons name="flash" size={16} color="#fff" />
                <Text style={styles.twentyFourText}>24x7 Available</Text>
              </View>
            ) : (
              <View style={styles.workingBox}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>From</Text>
                  <Text style={styles.timeValue}>{data.working_from || "Not Set"}</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>To</Text>
                  <Text style={styles.timeValue}>{data.working_to || "Not Set"}</Text>
                </View>
              </View>
            )}
          </View>

          {/* UNLOCK BUTTON BAR */}
          {!isUnlocked && (
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={handleUnlock}
              activeOpacity={0.8}
            >
              <Ionicons name="lock-open" size={18} color="#fff" />
              <Text style={styles.btnText}>
                {data.price == 0 ? "Free Unlock" : `Unlock Contact ${data.price} Credits 🪙`}
              </Text>
            </TouchableOpacity>
          )}

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.callBtn, !isUnlocked && styles.disabledBtn]}
              onPress={handleCall}
              activeOpacity={0.7}
              disabled={!isUnlocked}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.btnText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.whatsappBtn, !isUnlocked && styles.disabledBtn]}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
              disabled={!isUnlocked}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.btnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#5B21B6" },
  container: { flex: 1, backgroundColor: "#F5F3FF" }, 
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#F5F3FF' },
  loadingText: { marginTop: 10, color: '#6B38FB', fontSize: 14, fontWeight: '600' },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 38,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", flex: 1, marginHorizontal: 12 },
  walletBox: { backgroundColor: "rgba(255, 255, 255, 0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  walletText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  
  bannerWrapper: { position: "relative" },
  banner: { width: "100%", height: 200 },
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.1)" },
  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)", zIndex: 10 },
  lockOverlayText: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 8 },
  
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: -40,
    borderRadius: 20,
    alignItems: "center",
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    shadowColor: "#6B38FB",
    shadowOpacity: 0.06,
    elevation: 4,
  },
  icon: { width: 80, height: 80, borderRadius: 16, borderWidth: 3, borderColor: "#fff", marginTop: -55, backgroundColor: '#F3E8FF' },
  name: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginTop: 10, textAlign: 'center' },
  
  cardsBlockContainer: { paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    shadowColor: "#6B38FB",
    shadowOpacity: 0.03,
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "800", color: "#1E293B", marginLeft: 8 },
  value: { color: "#64748B", lineHeight: 20, fontSize: 13, fontWeight: '600' },
  phone: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5, color: "#1E293B" },
  lockText: { color: "#DC2626", marginTop: 6, fontWeight: "700", fontSize: 11 },
  
  unlockBtn: {
    backgroundColor: "#6B38FB",
    marginHorizontal: 14,
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14, marginLeft: 6 },
  
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 14, marginTop: 14 },
  callBtn: { flex: 1, backgroundColor: "#6B38FB", height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", flexDirection: "row", marginRight: 8 },
  whatsappBtn: { flex: 1, backgroundColor: "#25D366", height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  disabledBtn: { backgroundColor: "#CBD5E1", borderColor: '#E2E8F0' },
  
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { fontWeight: "700", fontSize: 12 },
  
  twentyFourBox: { backgroundColor: "#6B38FB", borderRadius: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  twentyFourText: { color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 13 },
  
  workingBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F3E8FF", borderRadius: 12, padding: 12 },
  timeItem: { flex: 1, alignItems: "center" },
  timeLabel: { color: "#6B38FB", fontSize: 11, marginBottom: 2, fontWeight: '700' },
  timeValue: { fontSize: 15, fontWeight: "800", color: "#5B21B6" },
  timeDivider: { width: 1, height: 30, backgroundColor: "#E9D5FF" },
});