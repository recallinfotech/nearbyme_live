import { eventBus } from "@/utils/events";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 प्रीमियम ग्रेडिएंट्स के लिए इम्पोर्ट किया
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getCombinedCategories, getWallet } from "../api/api";

const { width } = Dimensions.get("window");

type Category = {
  category_id: number;
  name: string;
  icon_url: string;
  sub_categories?: any[]; 
};

export default function CategoriesScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [walletBalance, setWalletBalance] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]); 
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadWallet();

    const refreshWallet = async () => {
      await loadWallet();
    };

    eventBus.on("walletUpdated", refreshWallet);
    return () => {
      eventBus.off("walletUpdated", refreshWallet);
    };
  }, []);

  const loadWallet = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (user?.id) {
        const walletRes = await getWallet(user.id);
        setWalletBalance(walletRes.data.data?.balance || 0);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadData = async () => {
    try {
      const catRes = await getCombinedCategories();
      const combinedData = catRes.data.data || [];
      setCategories(combinedData);

      let allSubs: any[] = [];
      combinedData.forEach((cat: any) => {
        if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
          allSubs = [...allSubs, ...cat.sub_categories];
        }
      });
      setAllSubCategories(allSubs);

    } catch (e) {
      console.log("Categories Screen Load Error:", e);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredItems([]);
      return;
    }

    const lower = text.toLowerCase();

    const matchedCategories = categories.filter((c) =>
      c.name.toLowerCase().includes(lower)
    );

    const matchedSubs = allSubCategories.filter((s) =>
      s.name.toLowerCase().includes(lower)
    );

    setFilteredItems([...matchedCategories, ...matchedSubs]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3FF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर (नो वाइट स्पेस) */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.topHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuTrigger}
          >
            <Text style={styles.menu}>☰ Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/wallet")}
            style={styles.walletBox}
          >
            <Ionicons name="wallet-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.walletText}>₹{Number(walletBalance).toFixed(2)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSub}>Select your category & service type</Text>

        {/* सर्च बार बॉक्स - न्यू लाइट पर्पल थीम */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search services..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* सर्च ड्रॉपडाउन */}
        {filteredItems.length > 0 && (
          <View style={styles.searchDropdown}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
              {filteredItems.map((item: any, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchItem}
                  onPress={() => {
                    setSearch("");
                    setFilteredItems([]);
                    router.push({
                      pathname: "/providers",
                      params: {
                        category_id: item.category_id || null,
                        sub_category_id: item.sub_category_id || null,
                      },
                    });
                  }}
                >
                  <Text style={styles.searchItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      {/* 📦 कैटेगरीज बॉडी */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {categories.map((category, catIndex) => {
          const softBackgrounds = [
            { bg: "#EFF6FF", border: "#BFDBFE" }, 
            { bg: "#ECFDF5", border: "#A7F3D0" }, 
            { bg: "#F5F3FF", border: "#E9D5FF" }, 
            { bg: "#FFF1F2", border: "#FECDD3" }, 
            { bg: "#FEF3C7", border: "#FDE68A" }, 
            { bg: "#F0FDF4", border: "#BBF7D0" }, 
          ];

          const colorSet = softBackgrounds[catIndex % softBackgrounds.length];

          return (
            <View key={category.category_id} style={styles.categorySection}>
              {/* कैटेगरी हेडर */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <TouchableOpacity
                    style={[styles.iconBox, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}
                    onPress={() => {
                      router.push({
                        pathname: "/providers",
                        params: { category_id: category.category_id },
                      });
                    }}
                  >
                    <Image source={{ uri: category.icon_url }} style={styles.categoryImage} />
                  </TouchableOpacity>

                  <View style={styles.titleInfo}>
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "/providers",
                          params: { category_id: category.category_id },
                        });
                      }}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.categorySub}>Available Services</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/providers",
                      params: { category_id: category.category_id },
                    });
                  }}
                >
                  <Text style={styles.viewAllText}>View All →</Text>
                </TouchableOpacity>
              </View>

              {/* सब-कैटेगरी ग्रिड */}
              <FlatList
                data={category.sub_categories || []}
                numColumns={3}
                scrollEnabled={false}
                keyExtractor={(item) => item.sub_category_id.toString()}
                columnWrapperStyle={styles.gridRowWrapper}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.subCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push({
                        pathname: "/providers",
                        params: {
                          category_id: category.category_id,
                          sub_category_id: item.sub_category_id,
                        },
                      });
                    }}
                  >
                    <View style={[styles.subIconBox, { backgroundColor: colorSet.bg }]}>
                      <Image source={{ uri: item.icon_url }} style={styles.subImage} />
                    </View>
                    <Text style={styles.subName} >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3FF", paddingHorizontal: 12, paddingTop: 14 },
  
  topHeader: { 
    paddingHorizontal: 14, 
    paddingTop: Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
    paddingBottom: 16, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    zIndex: 99,
    elevation: 4,
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuTrigger: { paddingVertical: 4 },
  menu: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  
  walletBox: { 
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12, 
    flexDirection: "row", 
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.3)"
  },
  walletText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  headerSub: { color: "#E9D5FF", fontSize: 12, marginTop: 4, fontWeight: "600" },
  
  /* 🌟 सर्च बॉक्स बैकग्राउंड अब लाइट पर्पल शेड में है */
  searchBar: { marginTop: 12, backgroundColor: "#F3E8FF", borderRadius: 10, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 13, color: "#000", paddingVertical: 0, fontWeight: '600' },
  searchIcon: { fontSize: 14 },
  
  searchDropdown: { position: "absolute", top: Platform.OS === "ios" ? 146 : (StatusBar.currentHeight ? StatusBar.currentHeight + 114 : 138), left: 14, right: 14, backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", borderWidth: 1.5, borderColor: "#E9D5FF", elevation: 5, shadowColor: "#6B38FB", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, zIndex: 999 },
  searchItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  searchItemText: { fontWeight: "700", fontSize: 13, color: "#1E293B" },
  
  /* 🌟 रिडिजाइन्ड प्रीमियम लिस्टिंग कार्ड */
  categorySection: { backgroundColor: "#fff", borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1.5, borderColor: "#E9D5FF", shadowColor: "#6B38FB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 10, borderWidth: 0.5, justifyContent: "center", alignItems: "center", marginRight: 10 },
  categoryImage: { width: 24, height: 24, resizeMode: "contain" },
  titleInfo: { justifyContent: "center" },
  categoryName: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  categorySub: { fontSize: 11, color: "#94A3B8", marginTop: 1, fontWeight: "600" },
  viewAllText: { fontSize: 11, fontWeight: "700", color: "#6B38FB" }, // 🌟 थीम के अनुसार बदला
  gridRowWrapper: { justifyContent: "flex-start", gap: 8 },
  subCard: { width: "31.5%", backgroundColor: "#FAFAFA", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8, alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
  subIconBox: { width: 38, height: 38, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  subImage: { width: 20, height: 20, resizeMode: "contain" },
  subName: { fontSize: 11, fontWeight: "700", textAlign: "center", color: "#334155", paddingHorizontal: 2 },
});