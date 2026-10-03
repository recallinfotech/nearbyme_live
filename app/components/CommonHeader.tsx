import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getWallet } from "@/app/api/api";

type Props = {
  navigation: any;

  search?: string;

  handleSearch?: (text: string) => void;

  filteredCategories?: any[];

  onSearchItemPress?: (
    item: any
  ) => void;
};

export default function CommonHeader({

  navigation,

  search = "",

  handleSearch,

  filteredCategories = [],

  onSearchItemPress,

}: Props) {

  // =========================
  // WALLET
  // =========================

  const [walletBalance,
  setWalletBalance] =
  useState(0);

  // =========================
  // LOAD WALLET
  // =========================

  const loadWallet =
  async () => {

    try {

      const user = JSON.parse(
        (await AsyncStorage.getItem(
          "user"
        )) || "{}"
      );

      if (user?.id) {

        const walletRes =
          await getWallet(user.id);

        setWalletBalance(
          walletRes.data.data
            ?.balance || 0
        );

      }

    } catch (e) {

      console.log(
        "Wallet Error:",
        e
      );

    }

  };

  useEffect(() => {

    loadWallet();

  }, []);

  return (

    <View style={styles.topHeader}>

      {/* ========================= */}
      {/* TOP ROW */}
      {/* ========================= */}

      <View style={styles.topRow}>

        {/* MENU */}

        <TouchableOpacity
          onPress={() =>
            navigation.dispatch(
              DrawerActions.openDrawer()
            )
          }
        >

          <Text style={styles.menu}>
            ☰
          </Text>

        </TouchableOpacity>



        {/* WALLET */}

        <TouchableOpacity

          onPress={() =>
            router.push("/wallet")
          }

          style={styles.walletBox}
        >

          <Text style={styles.walletText}>
            ₹{walletBalance}
          </Text>

        </TouchableOpacity>

      </View>



      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}

      <View style={styles.searchBar}>

        <TextInput

          placeholder="Search Business & Service Provider..."

          placeholderTextColor="#666"

          value={search}

          onChangeText={
            handleSearch
          }

          style={styles.input}

        />

        <Text style={styles.searchIcon}>
          🔍
        </Text>

      </View>



      {/* ========================= */}
      {/* SEARCH RESULTS */}
      {/* ========================= */}

      {filteredCategories.length >
        0 && (

        <View
          style={
            styles.searchDropdown
          }
        >

          <ScrollView
            nestedScrollEnabled
            style={{
              maxHeight: 250,
            }}
          >

            {filteredCategories.map(
              (
                item: any,
                index
              ) => (

                <TouchableOpacity

                  key={index}

                  style={
                    styles.searchItem
                  }

                  onPress={() =>
                    onSearchItemPress?.(
                      item
                    )
                  }
                >

                  <View
                    style={{
                      flexDirection:
                        "row",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",
                    }}
                  >

                    <View>

                      <Text
                        style={
                          styles.searchTitle
                        }
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={
                          styles.searchType
                        }
                      >

                        {item.sub_category_id
                          ? "Sub Category"
                          : "Category"}

                      </Text>

                    </View>



                    <Text
                      style={{
                        fontSize: 18,
                      }}
                    >
                      ➜
                    </Text>

                  </View>

                </TouchableOpacity>

              )
            )}

          </ScrollView>

        </View>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  // =========================
  // HEADER
  // =========================

  topHeader: {
    backgroundColor: "#1456c1",
    padding: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  menu: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },



  // =========================
  // WALLET
  // =========================

  walletBox: {
    backgroundColor:
      "rgba(86, 5, 5, 0.98)",

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 14,
  },

  walletText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },



  // =========================
  // SEARCH BAR
  // =========================

  searchBar: {
    marginTop: 18,

    backgroundColor: "#fff",

    borderRadius: 16,

    height: 56,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    paddingHorizontal: 16,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 4,

    elevation: 3,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },

  searchIcon: {
    fontSize: 20,
  },



  // =========================
  // SEARCH DROPDOWN
  // =========================

  searchDropdown: {
    backgroundColor: "#fff",

    borderRadius: 18,

    marginTop: 10,

    overflow: "hidden",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 5,

    elevation: 5,
  },

  searchItem: {
    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: "#f1f1f1",
  },

  searchTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },

  searchType: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 12,
  },

});