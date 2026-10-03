import { eventBus } from "@/utils/events";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addMoney,
  getTransactions,
  getWallet,
} from "../../api/api";

export default function Wallet() {

  const router = useRouter();

  const navigation =
    useNavigation<any>();

  const params =
    useLocalSearchParams();

  const [
    transactions,
    setTransactions,
  ] = useState<any[]>([]);

  const [balance, setBalance] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOAD DATA
  // =========================

  const loadData =
    async () => {

      try {

        setLoading(true);

        const user =
          JSON.parse(
            (await AsyncStorage.getItem(
              "user"
            )) || "{}"
          );

        if (!user?.id) {

          setLoading(false);

          return;

        }

        // WALLET

        const walletRes =
          await getWallet(
            user.id
          );

        setBalance(
          walletRes.data.data
            ?.balance || 0
        );

        // TRANSACTIONS

        const transRes =
          await getTransactions(
            user.id
          );

        setTransactions(
          transRes.data.data ||
            []
        );

      } catch (e) {

        console.log(
          "ERROR:",
          e
        );

      } finally {

        setLoading(false);

      }

    };

  // =========================
  // SCREEN FOCUS REFRESH
  // =========================

  useFocusEffect(

    useCallback(() => {

      loadData();

    }, [])

  );

  // =========================
  // EVENT BUS LISTENER
  // =========================

  useEffect(() => {

    const refreshWallet =
      () => {

        loadData();

      };

    eventBus.on(
      "walletUpdated",
      refreshWallet
    );

    return () => {

      eventBus.off(
        "walletUpdated",
        refreshWallet
      );

    };

  }, []);

  // =========================
  // ADD MONEY
  // =========================

  const handleAddMoney =
    async () => {

      try {

        const user =
          JSON.parse(
            (await AsyncStorage.getItem(
              "user"
            )) || "{}"
          );

        const res =
          await addMoney({
            user_id: user.id,
            amount: 100,
          });

        if (
          res.data.status
        ) {

          alert(
            "₹100 added successfully"
          );

          // INSTANT REFRESH

          await loadData();

          // GLOBAL UPDATE

          eventBus.emit(
            "walletUpdated"
          );

          // REDIRECT

          if (
            params.from ===
            "provider"
          ) {

            router.push(
              `/providers/${params.provider_id}`
            );

          }

        }

      } catch (e) {

        console.log(e);

      }

    };

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#F97316"
      />

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.dispatch(
              DrawerActions.openDrawer()
            )
          }
        >

          <Ionicons
            name="menu"
            size={26}
            color="#fff"
          />

        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          My Wallet
        </Text>

        <View
          style={{
            width: 26,
          }}
        />

      </View>

      {/* BALANCE CARD */}

      <View
        style={
          styles.balanceCard
        }
      >

        <View
          style={
            styles.balanceTop
          }
        >

          <View
            style={
              styles.walletIcon
            }
          >

            <Ionicons
              name="wallet"
              size={24}
              color="#fff"
            />

          </View>

          <TouchableOpacity
            style={
              styles.addButton
            }
            onPress={
              handleAddMoney
            }
            activeOpacity={
              0.8
            }
          >

            <Ionicons
              name="add"
              size={18}
              color="#fff"
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              Add ₹100
            </Text>

          </TouchableOpacity>

        </View>

        <Text
          style={
            styles.balanceLabel
          }
        >
          Available Balance
        </Text>

        <Text
          style={
            styles.balance
          }
        >
          ₹
          {Number(
            balance
          ).toFixed(2)}
        </Text>

      </View>

      {/* TRANSACTIONS */}

      <View
        style={
          styles.container2
        }
      >

        <View
          style={
            styles.transactionHeader
          }
        >

          <Text
            style={
              styles.transactionTitle
            }
          >
            Recent
            Transactions
          </Text>

        </View>

        {transactions.length ===
        0 ? (

          <View
            style={
              styles.emptyContainer
            }
          >

            <Ionicons
              name="receipt-outline"
              size={60}
              color="#CBD5E1"
            />

            <Text
              style={
                styles.emptyText
              }
            >
              No transactions
              found
            </Text>

          </View>

        ) : (

          <FlatList

            data={
              transactions
            }

            removeClippedSubviews={
              true
            }

            initialNumToRender={
              5
            }

            maxToRenderPerBatch={
              5
            }

            windowSize={5}

            updateCellsBatchingPeriod={
              50
            }

            style={{
              flex: 1,
            }}

            showsVerticalScrollIndicator={
              false
            }

            keyExtractor={(
              item: any
            ) =>
              item.id.toString()
            }

            contentContainerStyle={{
              paddingBottom: 30,
            }}

            renderItem={({
              item,
            }: any) => (

              <View
                style={
                  styles.transactionCard
                }
              >

                <View
                  style={[

                    styles.transactionIcon,

                    {
                      backgroundColor:
                        item.type ===
                        "debit"
                          ? "#FEE2E2"
                          : "#DCFCE7",
                    },

                  ]}
                >

                  <Ionicons
                    name={
                      item.type ===
                      "debit"
                        ? "arrow-down"
                        : "arrow-up"
                    }

                    size={18}

                    color={
                      item.type ===
                      "debit"
                        ? "#DC2626"
                        : "#16A34A"
                    }
                  />

                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.remark
                    }
                  >
                    {
                      item.remark
                    }
                  </Text>

                  <Text
                    style={
                      styles.date
                    }
                  >
                    Wallet
                    Transaction
                  </Text>

                </View>

                <Text
                  style={[

                    styles.amount,

                    {
                      color:
                        item.type ===
                        "debit"
                          ? "#DC2626"
                          : "#16A34A",
                    },

                  ]}
                >

                  {item.type ===
                  "debit"
                    ? "-"
                    : "+"}

                  ₹
                  {
                    item.amount
                  }

                </Text>

              </View>

            )}
          />

        )}

      </View>

    </SafeAreaView>

  );

}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F1F5F9",
    },

    container2: {
      flex: 1,
      marginHorizontal: 15,
      paddingBottom: 10,
    },

    /* HEADER */

    header: {
      backgroundColor:
        "#F97316",

      paddingHorizontal: 18,
      paddingTop: 42,
      paddingBottom: 18,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
    },

    headerTitle: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "700",
    },

    /* BALANCE CARD */

    balanceCard: {
      backgroundColor:
        "#2563EB",

      borderRadius: 22,

      padding: 18,

      marginTop: 12,
      marginBottom: 14,

      marginHorizontal: 15,

      shadowColor:
        "#2563EB",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.18,

      shadowRadius: 8,

      elevation: 5,
    },

    balanceTop: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 14,
    },

    walletIcon: {
      width: 50,
      height: 50,

      borderRadius: 15,

      backgroundColor:
        "rgba(255,255,255,0.15)",

      justifyContent:
        "center",

      alignItems: "center",
    },

    balanceLabel: {
      color: "#DBEAFE",
      fontSize: 14,
    },

    balance: {
      color: "#fff",
      fontSize: 30,
      fontWeight: "bold",
      marginTop: 4,
    },

    addButton: {
      backgroundColor:
        "rgba(255,255,255,0.18)",

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 14,

      flexDirection: "row",

      alignItems: "center",
    },

    addButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
      marginLeft: 4,
    },

    /* TRANSACTION */

    transactionHeader: {
      marginBottom: 12,
    },

    transactionTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: "#0F172A",
    },

    transactionCard: {
      backgroundColor:
        "#fff",

      borderRadius: 16,

      padding: 14,

      marginBottom: 10,

      flexDirection: "row",

      alignItems: "center",

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.04,

      shadowRadius: 4,

      elevation: 2,
    },

    transactionIcon: {
      width: 44,
      height: 44,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems: "center",

      marginRight: 12,
    },

    remark: {
      fontSize: 14,
      fontWeight: "700",
      color: "#0F172A",
    },

    date: {
      color: "#64748B",
      marginTop: 3,
      fontSize: 12,
    },

    amount: {
      fontSize: 16,
      fontWeight: "700",
    },

    emptyContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems: "center",
    },

    emptyText: {
      marginTop: 15,
      color: "#64748B",
      fontSize: 15,
    },

  });