import { eventBus } from "@/utils/events";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { createOrder, getTransactions, getWallet, verifyPayment } from "../../api/api";

// 🇮🇳 INDIAN DATE & TIME FORMATTER
const formatIndianDateTime = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const isoString = dateString.replace(" ", "T");
    const date = new Date(isoString);

    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return dateString;
  }
};

export default function Wallet() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams();

  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");

  // 🔍 FRONTEND FILTER STATES
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const loadData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const walletRes = await getWallet(user.id);
      setBalance(walletRes.data.data?.balance || 0);

      const transRes = await getTransactions(user.id);
      const fetchedList = transRes.data.data || [];
      setRawTransactions(fetchedList);
      applyFilters(fetchedList, filterType, sortOrder);
    } catch (e) {
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const refreshWallet = () => {
      loadData();
    };
    eventBus.on("walletUpdated", refreshWallet);
    return () => {
      eventBus.off("walletUpdated", refreshWallet);
    };
  }, []);

  // 🛠️ DYNAMIC FRONTEND FILTER & SORT ENGINE
  useEffect(() => {
    applyFilters(rawTransactions, filterType, sortOrder);
  }, [filterType, sortOrder]);

  const applyFilters = (
    list: any[],
    type: "all" | "credit" | "debit",
    order: "newest" | "oldest"
  ) => {
    let result = [...list];

    // 1. Credit / Debit Type Filter
    if (type !== "all") {
      result = result.filter((item) => item.type?.toLowerCase() === type);
    }

    // 2. Date Sort Filter (Newest / Oldest)
    result.sort((a, b) => {
      const timeA = new Date(a.created_at?.replace(" ", "T")).getTime() || 0;
      const timeB = new Date(b.created_at?.replace(" ", "T")).getTime() || 0;
      return order === "newest" ? timeB - timeA : timeA - timeB;
    });

    setFilteredTransactions(result);
  };

  const handleAddMoney = async (amountParam?: number) => {
    try {
      const finalAmount = amountParam || Number(customAmount) || selectedAmount;

      if (!finalAmount || finalAmount <= 0) {
        alert("Enter valid amount");
        return;
      }

      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");

      const orderRes = await createOrder({
        amount: finalAmount,
      });

      if (!orderRes.data.status) {
        alert("Order creation failed");
        return;
      }

      const options = {
        description: "Wallet Recharge",
        currency: "INR",
        key: orderRes.data.key,
        amount: finalAmount * 100,
        name: "Nearby",
        order_id: orderRes.data.order_id,
        prefill: {
          email: user.email || "",
          contact: user.phone || "",
          name: user.first_name || "",
        },
        theme: {
          color: "#6B38FB",
        },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          const verifyRes = await verifyPayment({
            user_id: user.id,
            amount: finalAmount,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          });

          if (verifyRes.data.status) {
            alert("Payment successful");
            await loadData();
            eventBus.emit("walletUpdated");
          } else {
            alert(verifyRes.data.message);
          }
        })
        .catch((error: any) => {
          console.log(error);
          alert("Payment cancelled");
        });
    } catch (e) {
      console.log(e);
      alert("Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 👑 PREMIUM HEADER */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.headerBtn}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Credits</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* 💳 BALANCE CARD */}
      <LinearGradient
        colors={["#31108F", "#1E0B58"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainCard}
      >
        <View style={styles.balanceRow}>
          <View style={styles.walletIconBox}>
            <Ionicons name="wallet" size={22} color="#FFF" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceText}>🪙 {Number(balance).toFixed(2)}</Text>
          </View>
        </View>

        {/* QUICK AMOUNT CHIPS */}
        <View style={styles.amountContainer}>
          {[10, 20, 50, 100].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.amountChip,
                selectedAmount === amt && !customAmount && styles.amountChipActive,
              ]}
              onPress={() => {
                setSelectedAmount(amt);
                setCustomAmount("");
              }}
            >
              <Text style={[
                styles.amountText,
                selectedAmount === amt && !customAmount && styles.amountTextActive
              ]}>
                + 🪙{amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CUSTOM AMOUNT INPUT */}
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>🪙</Text>
          <TextInput
            placeholder="Enter other amount"
            placeholderTextColor="#A78BFA"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(text) => setCustomAmount(text)}
            style={styles.customInput}
          />
        </View>

        {/* ADD ACTION BUTTON */}
        <TouchableOpacity style={styles.payButton} activeOpacity={0.8} onPress={() => handleAddMoney()}>
          <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.payButtonText}>Add Credit Now</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 🔄 TRANSACTION HISTORY & FILTERS */}
      <View style={styles.transactionSection}>
        <Text style={styles.transactionTitle}>Recent Transactions</Text>

        {/* 🟢🔴 CREDIT / DEBIT & DATE SORT FILTERS */}
        <View style={styles.filterRow}>
          {/* TYPE TABS */}
          <View style={styles.typeTabGroup}>
            <TouchableOpacity
              style={[styles.filterChip, filterType === "all" && styles.filterChipActive]}
              onPress={() => setFilterType("all")}
            >
              <Text style={[styles.filterChipText, filterType === "all" && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === "credit" && styles.filterChipCreditActive]}
              onPress={() => setFilterType("credit")}
            >
              <Text style={[styles.filterChipText, filterType === "credit" && styles.filterChipTextCredit]}>Credit 🟢</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === "debit" && styles.filterChipDebitActive]}
              onPress={() => setFilterType("debit")}
            >
              <Text style={[styles.filterChipText, filterType === "debit" && styles.filterChipTextDebit]}>Debit 🔴</Text>
            </TouchableOpacity>
          </View>

          {/* DATE SORT TOGGLE */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          >
            <Ionicons name="swap-vertical" size={14} color="#6B38FB" />
            <Text style={styles.sortBtnText}>{sortOrder === "newest" ? "Newest" : "Oldest"}</Text>
          </TouchableOpacity>
        </View>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>No matching transaction history</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }: any) => {
              const isDebit = item.type === "debit";
              return (
                <View style={styles.transactionCard}>
                  <View style={[styles.cardThemeBar, { backgroundColor: isDebit ? "#EF4444" : "#10B981" }]} />

                  <View style={[styles.transactionIcon, { backgroundColor: isDebit ? "#FEF2F2" : "#ECFDF5" }]}>
                    <Ionicons
                      name={isDebit ? "arrow-down" : "arrow-up"}
                      size={16}
                      color={isDebit ? "#EF4444" : "#10B981"}
                    />
                  </View>

                  <View style={styles.transDetails}>
                    <View style={styles.remarkRow}>
                      <Text style={styles.remark} numberOfLines={1}>{item.remark || "Wallet Transaction"}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: isDebit ? "#FEE2E2" : "#D1FAE5" }]}>
                        <Text style={[styles.typeBadgeText, { color: isDebit ? "#DC2626" : "#059669" }]}>
                          {item.type ? item.type.toUpperCase() : "INFO"}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.date}>
                      🕒 {formatIndianDateTime(item.created_at)}
                    </Text>
                  </View>

                  <Text style={[styles.amount, { color: isDebit ? "#EF4444" : "#10B981" }]}>
                    {isDebit ? "-" : "+"} 🪙{Number(item.amount).toFixed(2)}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36),
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  mainCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 14,
    shadowColor: "#6B38FB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  walletIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  balanceLabel: {
    color: "#DDD6FE",
    fontSize: 12,
    fontWeight: "600",
  },
  balanceText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountChip: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  amountChipActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  amountText: {
    color: "#DDD6FE",
    fontWeight: "700",
    fontSize: 12,
  },
  amountTextActive: {
    color: "#5B21B6",
  },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  currencySymbol: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    padding: 0,
  },
  payButton: {
    backgroundColor: "#6B38FB", 
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  transactionSection: {
    flex: 1,
    marginTop: 18,
    marginHorizontal: 14,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },

  // 🔍 FILTER STYLES
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeTabGroup: {
    flexDirection: "row",
    gap: 5,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#6B38FB",
    borderColor: "#5B21B6",
  },
  filterChipCreditActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
  },
  filterChipDebitActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterChipTextCredit: {
    color: "#059669",
  },
  filterChipTextDebit: {
    color: "#DC2626",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B38FB",
  },

  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9D5FF", 
    overflow: 'hidden'
  },
  cardThemeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginLeft: 4,
  },
  transDetails: {
    flex: 1,
    marginRight: 8,
  },
  remarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  remark: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  date: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
});