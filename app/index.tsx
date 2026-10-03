import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const user = await AsyncStorage.getItem("user");

    if (user) {
      router.replace("/(app)/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  };

  return null;
}
