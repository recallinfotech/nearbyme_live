import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
export { default } from "../profile/index";

<Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="person"
        size={size}
        color={color}
      />
    ),
  }}
/>