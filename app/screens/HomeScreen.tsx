import { eventBus } from "@/utils/events";
import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
  View,
} from "react-native";
import { getBanners, getCombinedCategories, getNearbyEvents, getWallet } from "../api/api"; // 🔥 1. getWallet import kiya

const { width } = Dimensions.get("window");
const EVENT_CARD_WIDTH = (width - 44) / 2.4; 

type Category = {
  category_id: number;
  name: string;
  icon_url: string;
  sub_categories?: any[];
};

type Event = {
  id: number;
  title: string;
  image: string;
  event_date: string;
  distance: number;
  category_name?: string; 
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("Home");
  const navigation = useNavigation<any>();
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  
  // 🔥 2. Balance state ko numeric 0 mapping pr set kiya dynamic response ke liye
  const [balance, setBalance] = useState<number>(0); 

  // बैनर स्टेट्स
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // ऑटो-स्लाइडर और होल्ड मैकेनिज्म के लिए Refs
  const bannerRef = useRef<FlatList>(null);
  const eventsRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<any>(null);
  const isHolding = useRef(false);

  useEffect(() => {
    loadData();
    return () => stopAutoScroll();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [banners, currentBannerIndex]);

  useEffect(() => {
    const refreshWallet = () => {
      loadWallet(); // 🔥 Directly load dynamic wallet on event notification
    };
    eventBus.on("walletUpdated", refreshWallet);
    return () => {
      eventBus.off("walletUpdated", refreshWallet);
    };
  }, []);

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      if (isHolding.current || !bannerRef.current || banners.length === 0) return;

      let nextIndex = currentBannerIndex + 1;
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }

      setCurrentBannerIndex(nextIndex);
      bannerRef.current.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  const handleBannerNav = (direction: "prev" | "next") => {
    if (banners.length === 0) return;
    let nextIndex = currentBannerIndex;

    if (direction === "next") {
      nextIndex = currentBannerIndex + 1 >= banners.length ? 0 : currentBannerIndex + 1;
    } else {
      nextIndex = currentBannerIndex - 1 < 0 ? banners.length - 1 : currentBannerIndex - 1;
    }

    setCurrentBannerIndex(nextIndex);
    bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const scrollEvents = () => {
    eventsRef.current?.scrollToOffset({
      offset: (EVENT_CARD_WIDTH + 10) * 2, 
      animated: true,
    });
  };

  // 🔥 3. Specialized independent function setup database sync ke liye
  const loadWallet = async () => {
    try {
      const userObj = await AsyncStorage.getItem("user");
      if (userObj) {
        const user = JSON.parse(userObj);
        if (user?.id) {
          const res = await getWallet(user.id);
          const walletData = res.data?.data;
          setBalance(walletData?.balance ?? 0);
        }
      }
    } catch (e) {
      console.log("Error loading dashboard wallet flow metrics:", e);
    }
  };

  const loadData = async () => {
    try {     
      setBannersLoading(true);
      setEventsLoading(true);

      try {
        const userObj = await AsyncStorage.getItem("user");
        if (userObj) {
          const loggedInUser = JSON.parse(userObj);
          if (loggedInUser && loggedInUser.first_name) {
            setUserName(loggedInUser.first_name);
          }
        }
      } catch (nameErr) {
        console.log("Error reading username:", nameErr);
      }

      // Simultaneously load system live dynamic credits
      loadWallet();

      const loc = await getUserLocation().catch((err) => { 
        console.log("Loc Error", err);   
        return null; 
      });  

      const [catRes] = await Promise.all([
        getCombinedCategories({ lat: loc?.lat, lng: loc?.lng }).catch((err) => { 
          console.log("Cat Error", err); 
          return null; 
        }),
      ]);

      getBanners()
        .then((bannerRes) => setBanners(bannerRes.data.data || []))
        .catch((bErr) => console.log("HomeScreen Banner Fetch Error:", bErr))
        .finally(() => setBannersLoading(false));

      if (catRes && catRes.data && catRes.data.data) {
        const combinedData = catRes.data.data;
        setCategories(combinedData);

        let allSubs: any[] = [];
        combinedData.forEach((cat: any) => {
          if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
            allSubs = [...allSubs, ...cat.sub_categories];
          }
        });
        setAllSubCategories(allSubs);
      }

      if (loc) {
        setLocation(loc);

        try {
          const eventRes = await getNearbyEvents({
            latitude: loc.lat,
            longitude: loc.lng,
            radius: 4,
          });
          setEvents(eventRes.data.data || []);
        } catch (evErr) {
          console.log("Events Fetch Error:", evErr);
        }

        Location.reverseGeocodeAsync({
          latitude: loc.lat,
          longitude: loc.lng,
        }).catch(() => {});
      }
    } catch (err) {  
      console.log("HomeScreen Data Fetch Error:", err);
    } finally {
      setEventsLoading(false);
      setBannersLoading(false);
    }
  };

  const handleBannerPress = (item: any) => {
    if (!item.image_url) return;
    if (item.image_url === item.full_image_url) {
      console.log("No custom redirect action set for this banner.");
      return;
    }

    try {
      if (item.image_url.startsWith("http://") || item.image_url.startsWith("https://")) {
        Linking.openURL(item.image_url);
      } else {
        router.push(item.image_url);
      }
    } catch (error) {
      console.log("Error opening banner redirect URL:", error);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredCategories([]);
      return;
    }
    const lower = text.toLowerCase();
    const matchedCategories = categories.filter((c) => c.name.toLowerCase().includes(lower));
    const matchedSub = allSubCategories.filter((s) => s.name.toLowerCase().includes(lower));
    setFilteredCategories([...matchedCategories, ...matchedSub]);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.eventCard}
      onPress={() => router.push(`/events/details?id=${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/400x200" }}
          style={styles.eventImage}
        />
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      </View>
      
      <View style={styles.eventBottomContent}>
        {item.category_name && (
          <Text numberOfLines={1} style={styles.eventCategoryTag}>
            {item.category_name.toUpperCase()}
          </Text>
        )}
        <Text numberOfLines={1} style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>📅 {item.event_date}</Text>
        <Text style={styles.eventDistance}>📍 {Number(item.distance).toFixed(1)} KM Away</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="light-content" backgroundColor="#5B21B6" />

      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Text style={styles.location}>☰ Welcome, {userName}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.premiumWalletBtn}
            onPress={() => router.push("/wallet")}
            activeOpacity={0.8}
          >
            <View style={styles.miniWalletIconBg}>
              <Ionicons name="wallet" size={12} color="#6B38FB" />
            </View>
            {/* 🔥 4. Display live formatted dynamic balance value */}
            <Text style={styles.premiumWalletText}>🪙 {Number(balance).toFixed(2)}</Text>
          </TouchableOpacity>
        </View>

        {/* सर्च बार */}
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
        {filteredCategories.length > 0 && (
          <View style={styles.searchDropdown}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
              {filteredCategories.map((item: any, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchItem}
                  onPress={() => {
                    setSearch("");
                    setFilteredCategories([]);
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* डायनेमिक बैनर सेक्शन */}
        {bannersLoading ? (
          <View style={styles.bannerLoaderContainer}>
            <ActivityIndicator size="small" color="#6B38FB" />
          </View>
        ) : banners.length === 0 ? null : (
          <View style={styles.bannerWrapper}>
            {banners.length > 1 && (
              <TouchableOpacity style={[styles.navArrow, styles.leftArrow]} onPress={() => handleBannerNav("prev")}>
                <Ionicons name="chevron-back" size={16} color="#000" />
              </TouchableOpacity>
            )}

            <FlatList
              ref={bannerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={banners}
              keyExtractor={(item) => item.id.toString()}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 24));
                setCurrentBannerIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => handleBannerPress(item)}
                  onPressIn={() => { isHolding.current = true; stopAutoScroll(); }}
                  onPressOut={() => { isHolding.current = false; startAutoScroll(); }}
                >
                  <Image 
                    source={{ uri: item.full_image_url || "https://via.placeholder.com/400x240" }} 
                    style={styles.bannerImage} 
                  />
                </TouchableOpacity>
              )}
            />

            {banners.length > 1 && (
              <TouchableOpacity style={[styles.navArrow, styles.rightArrow]} onPress={() => handleBannerNav("next")}>
                <Ionicons name="chevron-forward" size={16} color="#000" />
              </TouchableOpacity>
            )}

            {banners.length > 1 && (
              <View style={styles.dotsContainer}>
                {banners.map((_, index) => (
                  <View 
                    key={index} 
                    style={[styles.dot, currentBannerIndex === index && styles.activeDot]} 
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* इवेंट्स सेक्शन */}
        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>Nearby Events</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={() => router.push("/events")}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
            {events.length > 2 && (
              <TouchableOpacity style={styles.eventArrowBtn} onPress={scrollEvents}>
                <Ionicons name="arrow-forward-circle" size={20} color="#F97316" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* इवेंट्स रेंडर */}
        {eventsLoading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="small" color="#F97316" />
            <Text style={styles.loaderSubText}>Fetching events...</Text>
          </View>
        ) : events.length === 0 ? (
          <Text style={styles.emptyText}>No nearby events found</Text>
        ) : (
          <FlatList
            ref={eventsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={events.slice(0, 10)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEvent}
            contentContainerStyle={styles.horizontalListPadding}
          />
        )}

        {/* कैटेगरीज ग्रिड */}
        <Text style={styles.headingCategory}>Categories</Text>
        <FlatList
          data={categories}
          numColumns={4}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRowWrapper}
          keyExtractor={(item) => item.category_id.toString()}
          renderItem={({ item, index }) => {
            const bgColors = [
              "#EFF6FF", "#ECFDF5", "#F5F3FF", "#FFF1F2", "#FEF3C7", "#F0FDF4",
              "#FAFAFA", "#FFF7ED", "#FDF2F8", "#F0FDFA", "#F4F4F5", "#FAFAF9",
            ];
            const borderColors = [
              "#BFDBFE", "#A7F3D0", "#DDD6FE", "#FECDD3", "#FDE68A", "#BBF7D0",
              "#E4E4E7", "#FFEDD5", "#FBCFE8", "#CCFBF1", "#E4E4E7", "#E7E5E4",
            ];

            const colorIndex = (index % 4 * 3 + Math.floor(index / 4)) % bgColors.length;

            return (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/providers",
                    params: { category_id: item.category_id },
                  });
                }}
                style={[
                  styles.categoryCard,
                  { backgroundColor: bgColors[colorIndex], borderColor: borderColors[colorIndex] },
                ]}
              >
                <Image
                  source={{
                    uri: item.icon_url || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                  }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  topHeader: { 
    paddingHorizontal: 14, 
    paddingTop: Platform.OS === "ios" ? 24 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 32), 
    paddingBottom: 12, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    zIndex: 99 
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  location: { color: "#fff", fontSize: 16, fontWeight: "700" },
  
  premiumWalletBtn: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.25)", 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  miniWalletIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  premiumWalletText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  searchBar: { marginTop: 12, backgroundColor: "#fff", borderRadius: 10, height: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 13, color: "#000", paddingVertical: 0 },
  searchIcon: { fontSize: 14 },
  
  searchDropdown: { 
    position: "absolute", 
    top: Platform.OS === "ios" ? 92 : (StatusBar.currentHeight ? StatusBar.currentHeight + 78 : 100), 
    left: 14, 
    right: 14, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    zIndex: 999 
  },
  searchItem: { paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  searchItemText: { fontWeight: "600", fontSize: 13, color: "#1E293B" },
  container: { flex: 1, paddingHorizontal: 12 },
  
  bannerWrapper: { marginTop: 6, marginBottom: 6, position: "relative" },
  bannerImage: { width: width - 24, height: 240, borderRadius: 12, resizeMode: "cover" }, 
  bannerLoaderContainer: { height: 240, justifyContent: "center", alignItems: "center", marginTop: 12, marginBottom: 12 }, 
  navArrow: { position: "absolute", top: 104, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.75)", justifyContent: "center", alignItems: "center", zIndex: 10, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }, 
  leftArrow: { left: 8 },
  rightArrow: { right: 8 },
  dotsContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CBD5E1" },
  activeDot: { width: 14, backgroundColor: "#6B38FB" }, // एक्टिव डॉट का कलर भी रिच वॉइलेट किया

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 10 },
  heading: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  viewAll: { color: "#F97316", fontWeight: "700", fontSize: 12 },
  eventArrowBtn: { justifyContent: "center", alignItems: "center" },
  
  centerLoader: { paddingVertical: 20, alignItems: "center" },
  loaderSubText: { marginTop: 6, color: "#64748B", fontSize: 12 },
  emptyText: { textAlign: "center", marginVertical: 15, color: "#64748B", fontSize: 12 },
  horizontalListPadding: { paddingBottom: 4 },
  
  eventCard: { 
    width: EVENT_CARD_WIDTH, 
    height: EVENT_CARD_WIDTH + 70, 
    borderRadius: 12, 
    overflow: "hidden", 
    marginRight: 10, 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#F1F5F9", 
    elevation: 2, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  imageContainer: {
    width: EVENT_CARD_WIDTH,
    height: EVENT_CARD_WIDTH, 
    position: "relative"
  },
  eventImage: { 
    width: "100%",   
    height: "100%", 
    resizeMode: "cover" 
  },
  featuredBadge: { 
    position: "absolute", 
    right: 6, 
    top: 6, 
    backgroundColor: "#F97316", 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
    zIndex: 10 
  },
  featuredText: { color: "#fff", fontWeight: "700", fontSize: 8 },
  
  eventBottomContent: { backgroundColor: "#fff", paddingHorizontal: 6, paddingVertical: 4, justifyContent: "center" },
  eventCategoryTag: { color: "#F97316", fontSize: 8, fontWeight: "700", marginBottom: 1, letterSpacing: 0.5 },
  eventTitle: { color: "#1E293B", fontSize: 11, fontWeight: "700" },
  eventDate: { color: "#64748B", marginTop: 2, fontSize: 9 },
  eventDistance: { color: "#0F172A", marginTop: 1, fontWeight: "600", fontSize: 9 },
  
  headingCategory: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 14, marginBottom: 8 },
  categoryRowWrapper: { justifyContent: "space-between", marginBottom: 10 },
  categoryCard: { width: (width - 36) / 4, minHeight: 74, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, paddingVertical: 6, borderWidth: 0.5 },
  categoryImage: { width: 22, height: 22, resizeMode: "contain" },
  categoryName: { marginTop: 4, fontWeight: "700", textAlign: "center", fontSize: 9, color: "#334155", flexWrap: "wrap" },
});