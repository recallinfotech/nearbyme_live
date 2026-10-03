import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

import { getChildCategories } from "../api/api";

type ChildCategory = {
  sub_category_id: number;
  name: string;
  icon_url: string;
};

export default function ChildCategoryScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<ChildCategory[]>([]);

  useEffect(() => {
    loadChildCategories();
  }, []);

  const loadChildCategories = async () => {
    try {
      const res = await getChildCategories(id);
      setData(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Child Categories</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.sub_category_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.icon_url }} style={styles.image} />
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  text: { fontSize: 16 },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: "contain",
  },
});
