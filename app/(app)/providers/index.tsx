import { eventBus } from "@/utils/events";
import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getCombinedCategories, getProviders, getWallet, unlockProvider } from "../../api/api";

type Category = {
  category_id: number;
  name: string;
  icon_url: string;
  sub_categories?: any[];
};

type SubCategory = {
  sub_category_id: number;
  name: string;
  icon_url: string;
};

type Provider = {
  provider_id: number;
  business_name: string;
  address: string;
  rating: number;
  icon_url: string;
  distance: number;
  price: number;
  phone: string;
  is_unlocked: boolean;
  category_name?: string;     
  sub_category_name?: string; 
  is_verified?: number;         
  is_24x7_available?: number;   
  working_from?: string;        
  working_to?: string;          
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "N/A";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; 
  return `${hours}:${minutes} ${ampm}`;
};

export default function ProvidersScreen() {
  const params = useLocalSearchParams();
  const [walletBalance, setWalletBalance] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  const router = useRouter();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [rawProviders, setRawProviders] = useState<Provider[]>([]); // Full Stream
  const [displayProviders, setDisplayProviders] = useState<Provider[]>([]); // Distance Filtered List

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);

  const [location, setLocation] = useState<any>(null);
  const [radius, setRadius] = useState(2); // Default Range Tab: 2 KM
  const [search, setSearch] = useState("");

  useEffect(() => {
    init();
  }, [params.category_id, params.sub_category_id]);

  useEffect(() => {
    const refreshWallet = async () => {
      await loadWallet();
    };
    eventBus.on("walletUpdated", refreshWallet);
    return () => {
      eventBus.off("walletUpdated", refreshWallet);
    };
  }, []);

  // Distance Tab Switch handler for 60FPS Instant UI Filtering
  useEffect(() => {
    applyRadiusFilter(rawProviders, radius);
  }, [radius]);

  const init = async () => {
    setSubCategories([]);

    const categoryId = params.category_id ? Number(params.category_id) : null;
    const subCategoryId = params.sub_category_id ? Number(params.sub_category_id) : null;

    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);

    loadWallet();
    loadCombinedData(categoryId);

    loadProviders(categoryId, subCategoryId, null, "", 1, false);

    getUserLocation().then((loc) => {
      if (loc) {
        setLocation(loc);
        loadProviders(search ? null : categoryId, search ? null : subCategoryId, loc, search, 1, false);
      }
    }).catch(err => console.log("Background location fetch failed:", err));
  };

  const loadWallet = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (user?.id) {
        const walletRes = await getWallet(user.id);
        setWalletBalance(walletRes.data.data?.balance || 0);
      }
    } catch (e) {
      console.log("Wallet Error:", e);
    }
  };

  const loadCombinedData = async (currentCatId: number | null) => {
    try {
      const res = await getCombinedCategories();
      const combinedList = res.data.data || [];
      setCategories(combinedList);

      if (currentCatId) {
        const activeCat = combinedList.find((c: any) => c.category_id === currentCatId);
        if (activeCat && activeCat.sub_categories) {
          setSubCategories(activeCat.sub_categories);
        }
      }
    } catch (e) {
      console.log("Combined API Error on Screen:", e);
    }
  };

  // 🔥 Smooth Distance Filter Execution Engine
  const applyRadiusFilter = (list: Provider[], currentRadius: number) => {
    if (!list || list.length === 0) {
      setDisplayProviders([]);
      return;
    }

    let filtered = [...list];

    // Filter by Selected KM Tab
    filtered = filtered.filter((item) => {
      if (item.distance == null) return true;
      return Number(item.distance) <= Number(currentRadius);
    });

    // Distance ascending sort
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setDisplayProviders(filtered);
  };

  const loadProviders = async (
    cat?: number | null,
    sub?: number | null,
    locData?: any,
    searchText?: string,
    pageNo: number = 1,
    append: boolean = false,
  ) => {
    try {
      if (pageNo === 1 && !append) {
        setLoading(true);
      } else {
        setMoreLoading(true);
      }
      
      const loc = locData || location;
      const finalSearch = searchText !== undefined ? searchText : search;
      const finalCat = cat !== undefined ? cat : selectedCategory;
      const finalSub = sub !== undefined ? sub : selectedSubCategory;

      const res = await getProviders({
        category_id: finalSearch ? null : finalCat,
        sub_category_id: finalSearch ? null : finalSub,
        lat: loc?.lat,
        lng: loc?.lng,
        search: finalSearch,
        page: pageNo,
      });

      const paginatedData = res.data?.data || {};
      let fetchedList = paginatedData.data || [];
      const lastPage = paginatedData.last_page || 1;

      let updatedRawList = [];
      if (append) {
        updatedRawList = [...rawProviders, ...fetchedList];
      } else {
        updatedRawList = fetchedList;
      }

      setRawProviders(updatedRawList);
      applyRadiusFilter(updatedRawList, radius);

      setHasMore(pageNo < lastPage);
      setPage(pageNo);
    } catch (e) {
      console.log("Providers Load Error:", e);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || moreLoading || loading) return;
    const nextPage = page + 1;
    loadProviders(selectedCategory, selectedSubCategory, location, search, nextPage, true);
  };

  const handleUnlock = async (provider: any) => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      const walletRes = await getWallet(user.id);
      const balance = walletRes.data?.data?.balance ?? 0;

      if (balance <= 0) {
        if (Platform.OS === "web") {
          const confirmRecharge = window.confirm("Wallet empty hai. Recharge kare?");
          if (confirmRecharge) router.push("/wallet");
        } else {
          Alert.alert("Wallet Empty 💰", "Recharge kare?", [
            { text: "Cancel" },
            { text: "Recharge", onPress: () => router.push("/wallet") },
          ]);
        }
        return;
      }

      const res = await unlockProvider({
        user_id: user.id,
        provider_id: provider.provider_id,
      });

      if (!res.data.status) {
        alert(res.data.message);
        await loadWallet();
        eventBus.emit("walletUpdated");
        return;
      }

      const updateUnlockStatus = (pList: Provider[]) =>
        pList.map((p) => (p.provider_id === provider.provider_id ? { ...p, is_unlocked: true } : p));

      setRawProviders((prev) => updateUnlockStatus(prev));
      setDisplayProviders((prev) => updateUnlockStatus(prev));

      await loadWallet();
      eventBus.emit("walletUpdated");
      alert(res.data.message);
    } catch (e) {
      console.log(e);
    }
  };

  const renderProviderCard = ({ item }: { item: Provider }) => (
    <TouchableOpacity
      onPress={() => router.push(`/providers/${item.provider_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.compactRowCard}>
        <View style={styles.cardThemeBar} />

        <Image
          source={{ uri: item.icon_url || "https://cdn-icons-png.flaticon.com/512/869/869636.png" }}
          style={styles.cardImageCompact}
        />

        <View style={styles.cardContentCompact}>
          <View style={styles.topInfoCompact}>
            <Text style={styles.cardTitleCompact} numberOfLines={1}>
              {item.business_name}
            </Text>
            
            {Number(item.is_verified) === 1 ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified ✓</Text>
              </View>
            ) : <View />} 
          </View>

          {(item.category_name || item.sub_category_name) && (
            <View style={styles.categoryBadgeRow}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>
                📁 {item.category_name} 
                {item.sub_category_name ? ` • ${item.sub_category_name}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.timingRow}>
            {Number(item.is_24x7_available) === 1 ? (
              <View style={styles.alwaysOpenBadge}>
                <Text style={styles.alwaysOpenText}>🟢 24 Hours Open</Text>
              </View>
            ) : (
              <Text style={styles.timingText}>
                🕒 {formatTime(item.working_from)} - {formatTime(item.working_to)}
              </Text>
            )}
          </View>

          <View style={styles.locationRowCompact}>
            <Text style={styles.addressCompact} numberOfLines={1}>
              📍 {item.address}
            </Text>
            {item.distance != null && (
              <Text style={styles.distanceCompact}>
                ({getCleanDistance(item.distance)} km)
              </Text>
            )}
          </View>

          <View style={styles.contactRowCompact}>
            <Text style={styles.phoneTextCompact}>
              📞 {item.is_unlocked
                ? item.phone
                : item.phone && item.phone.length >= 3
                ? `${item.phone.slice(0, 3)}*******`
                : "852*******"}
            </Text>

            {!item.is_unlocked ? (
              <TouchableOpacity style={styles.unlockBtnCompact} onPress={() => handleUnlock(item)}>
                <Text style={styles.unlockTextCompact}>Unlock Contact {item.price || 0} 🪙</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionIconsCompact}>
                <TouchableOpacity
                  style={styles.iconBtnCompact}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Ionicons name="call" size={13} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtnCompact, { backgroundColor: "#25D366" }]}
                  onPress={() => {
                    const phone = item.phone.replace(/\s+/g, ''); 
                    const finalPhone = phone.startsWith("91") ? phone : `91${phone}`;
                    Linking.openURL(`https://wa.me/${finalPhone}`);
                  }}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* 📍 FAST DISCRETE DISTANCE TABS */}
      <View style={styles.filterBox}>
        <Text style={styles.rangeText}>Select Distance Range</Text>
        <View style={styles.tabContainer}>
          {[2, 4, 6, 8, 10].map((km) => (
            <TouchableOpacity
              key={km}
              activeOpacity={0.7}
              style={[styles.distTab, radius === km && styles.activeDistTab]}
              onPress={() => setRadius(km)}
            >
              <Text style={[styles.distTabText, radius === km && styles.activeDistTabText]}>
                {km} KM
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SELECTED CATEGORY CONTAINER */}
      {selectedCategory && (
        <View style={styles.selectedCategoryBox}>
          {categories
            .filter((item) => item.category_id === selectedCategory)
            .map((item) => (
              <View key={item.category_id} style={styles.selectedRow}>
                <View style={styles.selectedLeft}>
                  <View style={styles.selectedIconBox}>
                    <Image source={{ uri: item.icon_url }} style={styles.selectedIcon} />
                  </View>
                  <View>
                    <Text style={styles.selectedTitle}>{item.name}</Text>
                    <Text style={styles.selectedSub}>{search ? "Global Tag Search Active" : "Selected Category"}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => { setSearch(""); router.push("/categories"); }}>
                  <Text style={styles.changeBtn}>Change</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      {/* SUB-CATEGORY SCROLL LIST */}
      {subCategories.length > 0 && !search && (
        <View style={{ marginBottom: 6, paddingHorizontal: 2 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subCategories.map((item) => (
              <TouchableOpacity
                key={item.sub_category_id}
                style={[styles.subCard, selectedSubCategory === item.sub_category_id && styles.activeSubCard]}
                onPress={() => {
                  setSelectedSubCategory(item.sub_category_id);
                  loadProviders(selectedCategory, item.sub_category_id, location, search, 1, false);
                }}
              >
                <Image source={{ uri: item.icon_url }} style={styles.subImage} />
                <Text style={styles.subName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 🔥 EXACT ACCURATE DISPLAY COUNT */}
      <View style={styles.resultRow}>
        <Text style={styles.resultHeading}>Service Providers</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{displayProviders.length} Nearby Records</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F3FF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* TOP HEADER */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.blueHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuTrigger}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Services/ Business</Text>

          <TouchableOpacity onPress={() => router.push("/wallet")} style={styles.walletBox}>
            <Text style={styles.walletText}>₹{walletBalance}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6B38FB" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search name, owner or tags (e.g. leakage)"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              if (searchTimeout) clearTimeout(searchTimeout);
              const timeout = setTimeout(() => {
                loadProviders(null, null, location, text, 1, false);
              }, 500);
              setSearchTimeout(timeout);
            }}
            style={styles.input}
          />
        </View>
      </LinearGradient>

      {/* MAIN FLATLIST CONTAINER */}
      {loading && displayProviders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6B38FB" />
          <Text style={{ marginTop: 10, color: "#64748B", fontSize: 13, fontWeight: "600" }}>Fetching service providers...</Text>
        </View>
      ) : (
        <FlatList
          data={displayProviders}
          keyExtractor={(item, index) => `${item.provider_id}-${index}`}
          renderItem={renderProviderCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={() => (
            moreLoading ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#6B38FB" />
                <Text style={{ color: "#6B38FB", fontSize: 11, fontWeight: "600", marginTop: 4 }}>Loading more nearby records...</Text>
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", color: "#64748B", marginTop: 30, fontSize: 13, fontWeight: '500' }}>
              No business providers found within {radius} KM. Tap on a higher distance tab (e.g. 5 KM or 10 KM).
            </Text>
          )}
        />
      )}
    </View>
  );
}

const getCleanDistance = (dist: any) => {
  const d = Number(dist);
  return isNaN(d) ? "0.0" : d.toFixed(1);
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingBottom: 40, backgroundColor: "#F5F3FF" },
  blueHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36),
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuTrigger: { paddingRight: 12, paddingVertical: 4 },
  menuIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, flex: 1 },
  walletBox: { backgroundColor: "rgba(255, 255, 255, 0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  walletText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  searchBar: { marginTop: 14, backgroundColor: "#F3E8FF", borderRadius: 12, height: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  input: { flex: 1, fontSize: 14, color: "#0F172A", fontWeight: "600", paddingVertical: 0 },
  
  // 📍 TABS FILTER STYLING
  filterBox: { 
    backgroundColor: "#fff", 
    padding: 10, 
    borderRadius: 14, 
    marginTop: 12, 
    marginBottom: 4, 
    borderWidth: 1.5, 
    borderColor: '#E9D5FF', 
    elevation: 2 
  },
  rangeText: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: '#6B38FB', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 6 
  },
  distTab: { 
    flex: 1, 
    paddingVertical: 7, 
    borderRadius: 10, 
    backgroundColor: '#F3E8FF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E9D5FF' 
  },
  activeDistTab: { 
    backgroundColor: '#6B38FB', 
    borderColor: '#5B21B6' 
  },
  distTabText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#6B38FB' 
  },
  activeDistTabText: { 
    color: '#FFFFFF', 
    fontWeight: '900' 
  },

  selectedCategoryBox: { marginTop: 6, marginBottom: 4 },
  selectedRow: { backgroundColor: "#fff", borderRadius: 16, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderColor: '#E9D5FF' },
  selectedLeft: { flexDirection: "row", alignItems: "center" },
  selectedIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center", marginRight: 10 },
  selectedIcon: { width: 22, height: 22, resizeMode: "contain" },
  selectedTitle: { fontSize: 13, fontWeight: "800", color: "#1E293B" },
  selectedSub: { fontSize: 10, color: "#94A3B8", fontWeight: "500" },
  changeBtn: { color: "#6B38FB", fontWeight: "700", fontSize: 12 },
  
  subCard: { flexDirection: 'row', backgroundColor: "#fff", borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, alignItems: "center", borderWidth: 1, borderColor: "#E9D5FF", height: 36 },
  activeSubCard: { backgroundColor: "#F3E8FF", borderColor: "#6B38FB" },
  subImage: { width: 16, height: 16, marginRight: 6, resizeMode: "contain" },
  subName: { fontSize: 11, fontWeight: "700", color: "#6B38FB" },
  
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 },
  resultHeading: { fontSize: 13, fontWeight: "800", color: "#1E293B" },
  resultBox: { backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5, borderColor: '#E9D5FF' },
  resultText: { color: "#6B38FB", fontWeight: "700", fontSize: 11 },
  
  compactRowCard: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    marginBottom: 10, 
    borderRadius: 16, 
    padding: 12, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#E9D5FF', 
    shadowColor: "#6B38FB", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 3,
    overflow: 'hidden'
  },
  cardThemeBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#6B38FB' },
  cardImageCompact: { width: 56, height: 56, borderRadius: 10, marginRight: 12, backgroundColor: '#F3E8FF', marginLeft: 4 },
  cardContentCompact: { flex: 1, justifyContent: "center" },
  topInfoCompact: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }, 
  cardTitleCompact: { fontSize: 14, fontWeight: "800", color: "#1E293B", flex: 1, marginRight: 8 },
  
  verifiedBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  verifiedBadgeText: { fontSize: 9, fontWeight: "700", color: "#16A34A" },
  
  categoryBadgeRow: { marginBottom: 4 },
  categoryBadgeText: { fontSize: 11, color: "#6B38FB", fontWeight: "700" },
  
  timingRow: { marginBottom: 4 },
  alwaysOpenBadge: { backgroundColor: "#E0F2FE", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start" },
  alwaysOpenText: { fontSize: 10, fontWeight: "700", color: "#0284C7" },
  timingText: { fontSize: 11, color: "#64748B", fontWeight: "600" },

  locationRowCompact: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  addressCompact: { fontSize: 11, color: "#94A3B8", fontWeight: "500", maxWidth: "70%" },
  distanceCompact: { fontSize: 11, color: "#16A34A", fontWeight: "700", marginLeft: 4 },
  
  contactRowCompact: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  phoneTextCompact: { fontSize: 12, fontWeight: "600", color: "#334155" },
  unlockBtnCompact: { backgroundColor: "#6B38FB", paddingHorizontal: 10, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  unlockTextCompact: { color: "#fff", fontWeight: "700", fontSize: 11 },
  actionIconsCompact: { flexDirection: "row", alignItems: "center" },
  iconBtnCompact: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#6B38FB", justifyContent: "center", alignItems: "center", marginLeft: 6 },
});