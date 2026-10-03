import { Stack } from "expo-router";

export default function PartnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,    // डिफ़ॉल्ट हेडर छुपाने के लिए
        gestureEnabled: true,   // जेस्चर (स्वाइप बैक) चालू करने के लिए
      }}
    />
  );
}