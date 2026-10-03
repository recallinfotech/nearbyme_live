import { eventBus } from "@/utils/events";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { getWallet } from "@/app/api/api";

export default function WalletButton() {

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

  // =========================
  // EVENT LISTENER
  // =========================

  useEffect(() => {

    loadWallet();

    // LISTEN WALLET UPDATE

    eventBus.on(
      "walletUpdated",
      loadWallet
    );

    return () => {

      eventBus.off(
        "walletUpdated",
        loadWallet
      );

    };

  }, []);

  return (

    <TouchableOpacity

      onPress={() =>
        router.push("/wallet")
      }

      style={styles.walletBox}
    >

      <Text style={styles.walletText}>
       Credits {Number(walletBalance).toFixed(2)}
      </Text>

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({

  walletBox: {

    backgroundColor:
      "rgba(207, 93, 0, 0.98)",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 12,
  },

  walletText: {

    color: "#fff",

    fontWeight: "700",

    fontSize: 15,
  },

});