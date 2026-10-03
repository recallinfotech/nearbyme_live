import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";

import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,

  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getEventCategories,
  getNearbyEvents,
} from "../../api/api";

import { getUserLocation } from "@/utils/location";

 

const EventsScreen = () => {
  const [events, setEvents] =
    useState<any[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [radius, setRadius] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [searchTimeout, setSearchTimeout] =
    useState<any>(null);

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    loadCategories();
  }, []);

  // =========================
  // LOAD EVENTS
  // =========================

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, radius]);

  // =========================
  // GET CATEGORIES
  // =========================

  const loadCategories = async () => {
    try {
      const response =
        await getEventCategories();

      setCategories(
        response.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // GET EVENTS
  // =========================

  const loadEvents = async () => {
    try {
      setLoading(true);

      const location =
        await getUserLocation();

      if (!location) {
        return;
      }

      const response =
        await getNearbyEvents({
          latitude: location.lat,
          longitude: location.lng,
          category_id:
            selectedCategory,
          radius,
          search,
        });

      setEvents(
        response.data.data || []
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EVENT CARD
  // =========================

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push(
          `/events/details?id=${item.id}`
        )
      }
      style={styles.card}
    >
   <Image
  source={{
    uri: item.image
      ? item.image
      : "https://via.placeholder.com/400x200",
  }}
  style={styles.image}
/>

      <View style={styles.overlay}>
        <View style={styles.distanceBox}>
          <Text
            style={styles.distanceText}
          >
            📍{" "}
            {Number(
              item.distance
            ).toFixed(1)}{" "}
            KM
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text
            style={
              styles.categoryBadgeText
            }
          >
            {item.category_name ||
              "Event"}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={styles.title}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.description}
        >
          {item.description ||
            "No description available"}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.date}>
            📅 {item.event_date}
          </Text>

          <TouchableOpacity
            style={styles.button}
          >
            <Text
              style={styles.buttonText}
            >
              View
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // =========================
  // LOADER
  // =========================

  if (loading) {
    return (
      <View
        style={styles.loaderContainer}
      >
        <ActivityIndicator
          size="large"
          color="#000"
        />
      </View>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F7FA"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.heading}>
          Nearby Events
        </Text>

        <Text
          style={styles.subHeading}
        >
          Discover events happening
          around you
        </Text>
      </View>

      {/* TITLE */}

      <View style={styles.titleRow}>
        <View>
          <Text
            style={styles.sectionTitle}
          >
            🔥 Trending Events
          </Text>

          <Text
            style={styles.smallText}
          >
            {events.length} events
            found
          </Text>
        </View>

        <View
          style={styles.radiusBadge}
        >
          <Text
            style={
              styles.radiusBadgeText
            }
          >
            {radius} KM
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <View
        style={styles.searchWrapper}
      >
        <View
          style={styles.searchBox}
        >
          <Text
            style={styles.searchIcon}
          >
            🔍
          </Text>

          <TextInput
            placeholder="Search nearby events..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={(text) => {
              setSearch(text);

              if (searchTimeout)
                clearTimeout(
                  searchTimeout
                );

              const timeout =
                setTimeout(() => {
                  loadEvents();
                }, 400);

              setSearchTimeout(
                timeout
              );
            }}
            style={styles.searchInput}
          />
        </View>

        <Text
          style={styles.radiusText}
        >
          Within {radius} KM
        </Text>

        <Slider
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={radius}
          onValueChange={(val) =>
            setRadius(val)
          }
        />
      </View>

      {/* CATEGORY FILTER */}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
          snapToAlignment="start"
  decelerationRate="fast"
  style={{
    marginBottom: 12,
    paddingBottom: 20,
  }}
        data={[
          {
            id: "",
            name: "All",
          },
          ...categories,
        ]}
        keyExtractor={(
          item,
          index
        ) => index.toString()}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 10,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryTab,

              selectedCategory ==
                item.id &&
                styles.activeCategoryTab,
            ]}
            onPress={() => {
              setSelectedCategory(
                item.id
              );
            }}
          >
            <Text
              style={[
                styles.categoryTabText,

                selectedCategory ==
                  item.id &&
                  styles.activeCategoryText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* EVENTS */}

      <FlatList
        data={events}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingTop: 5,
        paddingBottom: 120,
        }}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyText}
            >
              <Text style={{ fontSize: 50 }}>🎉</Text>
              No nearby events found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default EventsScreen;

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

header: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 20,
  backgroundColor: "#111827",
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
},

 heading: {
  fontSize: 30,
  fontWeight: "800",
  color: "#fff",
},

subHeading: {
  marginTop: 6,
  fontSize: 14,
  color: "#D1D5DB",
},

  titleRow: {
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  smallText: {
    color: "#666",
    marginTop: 2,
  },

  radiusBadge: {
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },

  radiusBadgeText: {
    color: "#fff",
    fontWeight: "600",
  },

searchWrapper: {
  backgroundColor: "#fff",
  marginHorizontal: 15,
  borderRadius: 22,
  padding: 16,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#ECECEC",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
},

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 54,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  radiusText: {
    marginTop: 15,
    fontWeight: "600",
    color: "#333",
  },
 
  categoryTab: {
  backgroundColor: "#fff",
  paddingHorizontal: 22,
  height: 46,
  borderRadius: 25,
  marginRight: 10,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#ECECEC",
},

activeCategoryTab: {
  backgroundColor: "#111827",
  borderColor: "#111827",
},

categoryTabText: {
  color: "#444",
  fontWeight: "600",
  fontSize: 14,
  
},

  activeCategoryText: {
    color: "#fff",
  },

  card: {
  backgroundColor: "#fff",
  marginHorizontal: 15,
  marginTop: 16,
  borderRadius: 24,
  overflow: "hidden",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.08,
  shadowRadius: 10,

  elevation: 5,
},

  image: {
    width: "100%",
    height: 240,
  },

  overlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  distanceBox: {
    backgroundColor:
      "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
  },

  distanceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  content: {
    padding: 14,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },

  categoryBadgeText: {
    color: "#4338CA",
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },

  footer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  date: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },

button: {
  backgroundColor: "#111827",
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 14,
},

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});