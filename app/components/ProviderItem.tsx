import { StyleSheet, Text, View } from "react-native";

// 🔹 Type
type Provider = {
  provider_id: number;
  business_name: string;
  rating?: number;
  address?: string;
};

type Props = {
  item: Provider;
};

export default function ProviderItem({ item }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.business_name}</Text>
      <Text>⭐ {item.rating ?? 0}</Text>
      <Text>{item.address ?? "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
