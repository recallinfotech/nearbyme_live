import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getEventCategories, getNearbyEvents } from "../../api/api";

const EventsScreen = () => {
  const navigation = useNavigation<any>();

  // Dimensions और विड्थ का कैलकुलेशन
  const { width } = Dimensions.get("window");
  const EVENT_CARD_WIDTH = (width - 44) / 2.4;

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // STATES
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState("");
  
  const searchTimeout = useRef<any>(null); 
  const [location, setLocation] = useState<{ lat: any; lng: any } | null>(null);

  // कैटेगरीज और लोकेशन पैरेलल में फेच होंगी
  useEffect(() => {
    const initScreen = async () => {
      try {
        getEventCategories()
          .then((catRes) => {
            if (catRes && catRes.data) setCategories(catRes.data.data || []);
          })
          .catch((err) => console.log("Category Fetch Error:", err));

        const locRes = await getUserLocation().catch(() => null);

        if (locRes) {
          setLocation({ lat: locRes.lat, lng: locRes.lng });
          await fetchEvents(locRes.lat, locRes.lng, selectedCategory, radius, search);
        } else {
          setListLoading(false);
        }
      } catch (err) {
        console.log("Initialization Error", err);
        setListLoading(false);
      }
    };

    initScreen();
  }, []);

  // जब फिल्टर्स बदलें (कैटेगरी या रेडियस)
  useEffect(() => {
    if (location) {
      fetchEvents(location.lat, location.lng, selectedCategory, radius, search);
    }
  }, [selectedCategory, radius]);

  // कोर API कॉलिंग फ़ंक्शन
  const fetchEvents = async (lat: any, lng: any, catId: string, rad: number, query: string) => {
    try {
      setListLoading(true);
      const response = await getNearbyEvents({
        latitude: lat,
        longitude: lng,
        category_id: catId,
        radius: rad,
        search: query,
      });
      setEvents(response.data.data || []);
    } catch (error) {
      console.log("Fetch Events Error:", error);
    } finally {
      setListLoading(false);
    }
  };

  // सर्च बार हैंडलर (Debounce Logic)
  const handleSearchTextChange = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (location) {
        fetchEvents(location.lat, location.lng, selectedCategory, radius, text);
      }
    }, 400);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/events/details?id=${item.id}`)}
      style={[styles.eventCard, { borderColor: "#E9D5FF" }]}
    >
      {/* कार्ड के लेफ्ट side की प्रीमियम थीम बार */}
      <View style={[styles.cardThemeBar, { backgroundColor: "#6B38FB" }]} />

      <View style={styles.eventContent}>
        <View style={styles.badgeRow}>
          <View style={[styles.imageBadge, { backgroundColor: "#EEF2FF", borderColor: "#E9D5FF" }]}>
            <Text style={[styles.imageBadgeText, { color: "#6B38FB" }]}>
              {item.category_name || "EVENT"}
            </Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.starText}>⭐</Text>
            <Text style={styles.ratingValue}>4.1</Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.eventTitle}>
          {item.title || "Nearby Event"}
        </Text>

        <Text style={styles.eventMetaText} numberOfLines={1}>
          🗓️ {item.event_date || "12 March 2026"}
        </Text>

        <Text style={styles.eventMetaText} numberOfLines={1}>
          📍 {item.location || "Town Hall"}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.distanceText, { color: "#7C3AED" }]}>
            📍 {item.distance ? Number(item.distance).toFixed(1) : "1.5"} km away
          </Text>
        </View>
      </View>

      {/* राइट साइड इमेज कंटेनर */}
      <View style={[styles.imageContainer, { backgroundColor: "#F3E8FF" }]}>
        <Image
          source={{
            uri: item.image ? item.image : "https://via.placeholder.com/150",
          }}
          style={styles.eventImage}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    // 🌟 फिक्स 1: यहाँ SafeAreaView को हटाकर सिंपल View कर दिया है, ताकि कंटेंट पूरा ऊपर तक जाए
    <View style={styles.container}>
      {/* स्टेटस बार को ट्रांसपेरेंट टोन में रखा */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* प्रीमियम रॉयल वॉइलेट/पर्पल ग्रेडिएंट हेडर */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.topHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Text style={styles.location}>☰ Events</Text>
          </TouchableOpacity>
          <Text style={styles.smallText}>{events.length} events found</Text>
        </View>
      </LinearGradient>

      {/* कॉम्पैक्ट फिल्टर कार्ड */}
      <View style={styles.filterCard}>
        <View style={[styles.searchBox, { backgroundColor: "#F3E8FF" }]}>
          <Ionicons name="search-outline" size={16} color="#6B38FB" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchTextChange}
            style={styles.searchInput}
          />
        </View>

        {/* रेंज स्लाइडर */}
        <View style={styles.sliderRow}>
          <Text style={styles.rangeTitle}>Distance Range</Text>
          <Slider
            style={{ flex: 1, height: 30, marginHorizontal: 4 }}
            minimumValue={1}
            maximumValue={15}
            step={1}
            minimumTrackTintColor="#6B38FB" 
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#6B38FB" 
            value={radius}
            onValueChange={(val) => setRadius(val)}
          />
          <View style={[styles.rangeBadge, { backgroundColor: "#EEF2FF", borderColor: "#E9D5FF" }]}>
            <Text style={[styles.rangeBadgeText, { color: "#6B38FB" }]}>+{radius} km</Text>
          </View>
        </View>
      </View>

      {/* हॉरिजॉन्टल कैटेगरीज */}
      <View style={{ height: 44, marginBottom: 4 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: "", name: "All Events" }, ...categories]}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 14, alignItems: "center" }}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryTab, isActive && { backgroundColor: "#6B38FB", borderColor: "#6B38FB" }]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.categoryTabText, isActive && { color: "#fff" }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 📅 इवेंट्स लिस्ट या लोडर */}
      {listLoading ? (
        <View style={styles.listLoaderContainer}>
          <ActivityIndicator size="large" color="#6B38FB" />
          <Text style={styles.loaderSubText}>Finding nearby events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={44} color="#94A3B8" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>No nearby events found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  listLoaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  loaderSubText: { marginTop: 8, color: "#64748B", fontSize: 12, fontWeight: "500" },
  
  /* 🌟 फिक्स 2: paddingTop को डायनेमिकली हैंडल किया ताकि ग्रेडिएंट स्टेटस बार के एकदम पीछे चिपक जाए */
  topHeader: { 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === "ios" ? 24 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
    paddingBottom: 16, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuButton: { paddingVertical: 4 },
  location: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  smallText: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12, fontWeight: "600" },
  
  filterCard: { backgroundColor: "#fff", marginHorizontal: 12, borderRadius: 14, padding: 10, marginTop: 12, marginBottom: 10, borderWidth: 1, borderColor: "#F1F5F9", elevation: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, height: 38 },
  searchInput: { flex: 1, fontSize: 13, color: "#000", paddingVertical: 0, fontWeight: "600" },
  
  sliderRow: { flexDirection: "row", alignItems: "center", marginTop: 10, justifyContent: "space-between" },
  rangeTitle: { fontSize: 11, fontWeight: "700", color: "#475569", width: 85 },
  rangeBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rangeBadgeText: { fontWeight: "700", fontSize: 10 },
  
  categoryTab: { backgroundColor: "#fff", paddingHorizontal: 14, height: 32, borderRadius: 8, marginRight: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  categoryTabText: { color: "#64748B", fontWeight: "600", fontSize: 12 },
  
  eventCard: { 
    backgroundColor: "#fff", 
    marginHorizontal: 12, 
    marginBottom: 10, 
    borderRadius: 14, 
    flexDirection: "row", 
    overflow: "hidden", 
    borderWidth: 1.5, 
    elevation: 3, 
    shadowColor: "#6B38FB", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 3 
  },
  cardThemeBar: {
    width: 4,
    height: "100%"
  },
  eventContent: { flex: 1, padding: 12, justifyContent: "center" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  imageBadge: { borderWidth: 0.5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imageBadgeText: { fontWeight: "700", fontSize: 9, textTransform: "uppercase" }, 
  ratingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  starText: { fontSize: 9, marginRight: 2 },
  ratingValue: { fontSize: 9, color: "#334155", fontWeight: "700" },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
  eventMetaText: { color: "#64748B", fontSize: 11, fontWeight: "500", marginTop: 2 },
  bottomRow: { marginTop: 6, paddingTop: 4 },
  distanceText: { fontWeight: "700", fontSize: 11 }, 
  
 imageContainer: { 
    width: 80,               // स्क्वायर लुक के लिए एक फिक्स चौड़ाई
    height: 80,              // चौड़ाई के बराबर ऊंचाई (1:1 स्क्वायर रेशियो)
    alignSelf: "center", 
    marginRight: 10, 
    borderRadius: 8, 
    overflow: "hidden",
    backgroundColor: "#F3E8FF", // अगर इमेज लोड न हो तो बैकग्राउंड टोन
  },
  eventImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover"      // स्क्वायर बॉक्स में बिना खाली जगह छोड़े इमेज को फिट करेगा
  },
  emptyContainer: { marginTop: 60, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: "#94A3B8", fontWeight: "500" },
});