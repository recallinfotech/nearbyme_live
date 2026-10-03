import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getCategories, getProviders } from "../api/api";
import CategoryItem from "../components/CategoryItem";
import ProviderItem from "../components/ProviderItem";

type Category = {
  category_id: number;
  name: string;
  icon_url: string;
};

type Provider = {
  provider_id: number;
  business_name: string;
  rating?: number;
  address?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const catRes = await getCategories();
      const provRes = await getProviders();

      setCategories(catRes.data.data || []);
      setProviders(provRes.data.data.data || []);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  // 🔥 FIND DRAWER IN PARENT CHAIN
  const openDrawer = () => {
    let parent = navigation;

    while (parent) {
      try {
        parent.dispatch(DrawerActions.openDrawer());
        return;
      } catch (e) {
        parent = parent.getParent?.();
      }
    }

    console.log("Drawer not found");
  };

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Text style={styles.menu}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Nearby App</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔹 Categories */}
        <Text style={styles.heading}>Categories</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.category_id.toString()}
          renderItem={({ item }) => <CategoryItem item={item} />}
        />

        {/* 🔹 Providers */}
        <Text style={styles.heading}>Nearby Services</Text>

        {providers.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No providers found
          </Text>
        ) : (
          providers.map((item) => (
            <ProviderItem key={item.provider_id} item={item} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  menu: {
    fontSize: 22,
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
});
