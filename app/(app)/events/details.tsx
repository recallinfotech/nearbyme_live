import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 ग्रेडिएंट इम्पोर्ट किया
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getEventDetails } from "../../api/api";

const { width } = Dimensions.get("window");

const EventDetails = () => {
  const navigation = useNavigation<any>();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [imageRatio, setImageRatio] = useState<number>(1); 

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const response = await getEventDetails(Number(id));
      const eventData = response.data.data;
      setEvent(eventData);

      if (eventData?.image) {
        Image.getSize(
          eventData.image,
          (imgWidth, imgHeight) => {
            if (imgWidth && imgHeight) {
              setImageRatio(imgWidth / imgHeight); 
            }
          },
          (error) => console.log("Error getting image size:", error)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!event) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6B38FB" />
        <Text style={styles.loaderText}>Loading Event Details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 🖼️ इमेज रैपर (अब नीचे से बिलकुल नहीं कटेगी) */}
        <View style={[styles.imageWrapper, { aspectRatio: imageRatio }]}>
          <Image
            source={{
              uri: event.image ? event.image : "https://via.placeholder.com/800x800",
            }}
            style={styles.image}
          />
          <View style={styles.gradientOverlay} />

          {/* 👑 फ्लोटिंग हेडर */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleActionBtn}>
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>

            <View style={styles.floatingRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{event.category_name || "Featured"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 📝 मेन कंटेंट ब्लॉक */}
        <View style={styles.contentCard}>
          
          {/* 🌟 हेडर बैकग्राउंड को प्रीमियम थीम ग्रेडिएंट में बदला */}
          <LinearGradient
            colors={["#B91C1C", "#6B38FB", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradientBox}
          >
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.ratingRow}>
              <View style={styles.starBox}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.ratingText}>4.1</Text>
              </View>
              <Text style={styles.reviewText}>(120+ Interested)</Text>
            </View>
          </LinearGradient>

          {/* 📅 डेट और टाइम डिटेल्स */}
          <View style={styles.metaItem}>
            <View style={[styles.metaIconBox, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="calendar" size={20} color="#6B38FB" />
            </View>
            <View style={styles.metaInfo}>
              <Text style={styles.metaLabel}>Date and Time</Text>
              <Text style={styles.metaValue}>{event.event_date || "12 March 2026"}</Text>
            </View>
          </View>

          {/* 📍 लोकेशन डिटेल्स */}
          <View style={styles.metaItem}>
            <View style={[styles.metaIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="location" size={20} color="#0284C7" />
            </View>
            <View style={styles.metaInfo}>
              <Text style={styles.metaLabel}>Venue Location</Text>
              <Text style={styles.metaValue}>{event.address || event.location || "Town Hall"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 📖 अबाउट डिस्क्रिप्शन */}
          <View style={styles.descriptionBox}>
            <Text style={styles.sectionTitle}>About the Event</Text>
            <Text style={styles.description}>
              {event.description || "No description available for this event. Please reach out to the venue coordinator for more details."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🎟️ बॉटम बार */}
      <View style={styles.bottomActionBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Entry Status</Text>
          <Text style={styles.priceValue}>Open for All</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryActionBtn}
          activeOpacity={0.8}
          onPress={() => alert("Registration/Booking feature coming soon!")}
        >
          <Text style={styles.primaryActionText}>Reserve a Spot</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  imageWrapper: {
    position: "relative",
    width: width,
    backgroundColor: "#F1F5F9", 
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", 
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)", 
  },
  floatingHeader: {
    position: "absolute",
    top: 12, 
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  floatingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "#6B38FB", 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },

  /* कंटेंट कार्ड */
  contentCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0, // 🌟 इमेज कटने से रोकने के लिए नेगेटिव मार्जिन (-20) को 0 कर दिया
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 400,
  },
  
  /* 🌟 न्यू इवेंट हेडर ग्रेडिएंट बॉक्स स्टाइल */
  headerGradientBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#6B38FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF", // 🌟 ग्रेडिएंट के ऊपर टेक्स्ट वाइट किया
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  starBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // हल्का ट्रांसपेरेंट वाइट बॉक्स
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF", // टेक्स्ट वाइट किया
  },
  reviewText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)", // हल्का सा धुंधला वाइट ताकि सुंदर दिखे
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 18,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metaIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  metaInfo: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
    marginTop: 2,
  },
  descriptionBox: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0F172A",
  },
  description: {
    fontSize: 14,
    lineHeight: 23,
    color: "#475569",
    fontWeight: "400",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#059669",
    marginTop: 1,
  },
  primaryActionBtn: {
    backgroundColor: "#6B38FB", 
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 4,
    shadowColor: "#6B38FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});