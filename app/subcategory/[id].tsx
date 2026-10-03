import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getSubCategories } from "../api/api";

type SubCategory = {
  sub_category_id: number;
  name: string;
  icon_url: string;
};

type Props = {
  item: SubCategory;
};

export default function SubCategoryScreen({ item }: any) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<SubCategory[]>([]);

  useEffect(() => {
    loadSubCategories();
  }, []);

  const loadSubCategories = async () => {
    try {
      const res = await getSubCategories(id);
      setData(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sub Categories</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.sub_category_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.box}
            onPress={() =>
              router.push(`/childcategory/${item.sub_category_id}`)
            }
          >
            <View style={styles.card}>
              <Image source={{ uri: item.icon_url }} style={styles.image} />
              <Text style={styles.text}>{item.name}</Text>
            </View>
          </TouchableOpacity>
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
