import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
// 🔹 Type
type Category = {
  category_id: number;
  name: string;
  icon_url: string;
};

type Props = {
  item: Category;
};

export default function CategoryItem({ item }: any) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.box}
      onPress={() => router.push(`/subcategory/${item.category_id}`)}
    >
      <Image source={{ uri: item.icon_url }} style={styles.image} />
      <Text style={styles.text}>{item.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    elevation: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: "contain",
  },
  text: {
    fontWeight: "600",
    marginTop: 6,
    fontSize: 12,
  },
});
