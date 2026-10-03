import { Stack } from "expo-router";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Unable to activate keep awake",
]);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}