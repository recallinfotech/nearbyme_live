import Slider from "@react-native-community/slider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
 
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import WalletButton from "../components/WalletButton";

import {
  getCategories,
  getNearbyEvents,

  getSubCategories
} from "../api/api";


import { getUserLocation } from "@/utils/location";

type Category = {
  category_id: number;
  name: string;
  icon_url: string;
};

type Event = {
  id: number;
  title: string;
  image: string;
  event_date: string;
  distance: number;
};

 

export default function HomeScreen() {

 
  const [selectedCategory,
setSelectedCategory] =
useState<number | null>(null);

const [selectedSubCategory,
setSelectedSubCategory] =
useState<number | null>(null);

const [allSubCategories,
setAllSubCategories] =
useState<any[]>([]);

const [subCategories,
setSubCategories] =
useState<any[]>([]);

const [search,
setSearch] =
useState("");

const [filteredCategories,
setFilteredCategories] =
useState<any[]>([]);

  const [locationName, setLocationName] =
  useState("Loading...");
  const navigation = useNavigation<any>();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [events, setEvents] =
    useState<Event[]>([]);

const [radius, setRadius] =
  useState(2);

 

const [location, setLocation] =
  useState<any>(null);

 useEffect(() => {

  loadData();

}, [
  radius,
  selectedCategory,
  selectedSubCategory,
  search,
]);



  // =========================
  // LOAD DATA
  // =========================

 const loadData = async () => {

  try {

    // CATEGORIES
    const catRes =
      await getCategories();

    setCategories(
      catRes.data.data || []
    );

    let allSubs: any[] = [];

for (const cat of catRes.data.data) {

  try {

    const subRes =
      await getSubCategories(
        cat.category_id
      );

    allSubs = [
      ...allSubs,
      ...(subRes.data.data || []),
    ];

  } catch (e) {}

}

setAllSubCategories(
  allSubs
);



    // LOCATION
    const loc =
      await getUserLocation();

    if (!loc) return;

    setLocation(loc);

 

const place =
  await Location.reverseGeocodeAsync({
    latitude: loc.lat,
    longitude: loc.lng,
  });

if (place.length > 0) {

  const area =
    place[0].district ||
    place[0].subregion ||
    place[0].city;

  const city =
    place[0].city;

  setLocationName(
    `${area}, ${city}`
  );

}


    // EVENTS
    const eventRes =
      await getNearbyEvents({
        latitude: loc.lat,
        longitude: loc.lng,
        radius,
      });

    setEvents(
      eventRes.data.data || []
    );



    
  } catch (err) {

    console.log(err);

  }

};



  // =========================
  // OPEN DRAWER
  // =========================

 


  // =========================
  // EVENT CARD
  // =========================

 const renderEvent = ({ item }: any) => (

  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.eventCard}
    onPress={() =>
      router.push(
        `/events/details?id=${item.id}`
      )
    }
  >

    <Image
      source={{
        uri: item.image
          ? item.image
          : "https://via.placeholder.com/400x200",
      }}
      style={styles.image}
    />



    {/* OVERLAY */}

    <View style={styles.overlay}>



      <View style={styles.featuredBadge}>

        <Text style={styles.featuredText}>
          Featured
        </Text>

      </View>



      <View style={styles.bottomContent}>

        <Text
          numberOfLines={1}
          style={styles.overlayTitle}
        >
          {item.title}
        </Text>

        <Text style={styles.overlayDate}>
          📅 {item.event_date}
        </Text>

        <Text style={styles.overlayDistance}>
          📍{" "}
          {Number(
            item.distance
          ).toFixed(1)}{" "}
          KM Away
        </Text>

      </View>

    </View>

  </TouchableOpacity>

);

const handleSearch = (
  text: string
) => {

  setSearch(text);

  if (!text.trim()) {

    setFilteredCategories([]);

    return;

  }

  const lower =
    text.toLowerCase();

  // CATEGORY MATCH
  const matchedCategories =
    categories.filter((c) =>
      c.name
        .toLowerCase()
        .includes(lower)
    );

  // ALL SUBCATEGORY MATCH
  const matchedSub =
    allSubCategories.filter((s) =>
      s.name
        .toLowerCase()
        .includes(lower)
    );

  setFilteredCategories([
    ...matchedCategories,
    ...matchedSub,
  ]);

};

  return (

   <View style={{ flex: 1 }}>


      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

    <View style={styles.topHeader}>

  <View style={styles.topRow}>

    <View>

       {/*<Text style={styles.location}>
        📍 {locationName}
      </Text>*/}

      <Text style={styles.location}>
         <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Text style={{ fontSize: 20 }}>☰ Home</Text>
        </TouchableOpacity>
      </Text>

    </View>

    <WalletButton />

  </View>



  {/* SEARCH */}

  <View style={styles.searchBar}>

  <TextInput
    placeholder="Search services..."
    value={search}
    onChangeText={handleSearch}
    style={{ flex: 1 }}
  />

  <Text style={styles.searchIcon}>
    🔍
  </Text>

</View>

{filteredCategories.length > 0 && (

<View style={styles.searchDropdown}>

  {filteredCategories.map(
    (item: any, index) => (

    <TouchableOpacity

      key={index}

      style={styles.searchItem}

    onPress={() => {

  setSearch("");

  setFilteredCategories([]);

  router.push({

    pathname: "/providers",

    params: {

      category_id:
        item.category_id || null,

      sub_category_id:
        item.sub_category_id || null,

    },

  });

}}
    >

      <Text
        style={{
          fontWeight: "700",
        }}
      >
        {item.name}
      </Text>

    </TouchableOpacity>

  ))}
</View>

)}

</View>

 <View style={styles.container}>

<View style={styles.rangeWrapper}>

 

  <Text style={styles.rangeLabel}>
    Location Range Within {radius} KM
  </Text>

  <Slider
    minimumValue={1}
    maximumValue={20}
    step={1}
    value={radius}
    onValueChange={(val) =>
      setRadius(val)
    }
    minimumTrackTintColor="#0EA5E9"
    maximumTrackTintColor="#D1D5DB"
  />

</View>
 
 

     <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{
    paddingBottom: 120,
  }}
  showsVerticalScrollIndicator={false}
>




        {/* ========================= */}
        {/* EVENTS */}
        {/* ========================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.heading}>
            Nearby Events
          </Text>



          <TouchableOpacity
            onPress={() =>
              router.push("/events")
            }
          >

            <Text style={styles.viewAll}>
              View All
            </Text>

          </TouchableOpacity>

        </View>



        {events.length === 0 ? (

          <Text
            style={styles.emptyText}
          >
            No nearby events found
          </Text>

        ) : (

          

       <FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={events.slice(0, 10)}
  keyExtractor={(item) =>
    item.id.toString()
  }
  renderItem={renderEvent}
/>



        )}


        {/* ========================= */}
        {/* CATEGORIES */}
        {/* ========================= */}

        <Text style={styles.heading}>
          Categories
        </Text>



        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) =>
            item.category_id.toString()
          }
        renderItem={({ item, index }) => {

  const colors = [
    "#FFE8D6",
    "#D9F8C4",
    "#CDE7FF",
    "#FFE4E6",
  ];

  return (

    <TouchableOpacity

onPress={async () => {

  setSelectedCategory(
    item.category_id
  );

  setSelectedSubCategory(null);

  const subRes =
    await getSubCategories(
      item.category_id
    );

  setSubCategories(
    subRes.data.data || []
  );

}}
      style={[
        styles.categoryCard,
        {
          backgroundColor:
            colors[index % 4],
        },
      ]}
    >

      <Image
        source={{
          uri:
            item.icon_url ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
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

        {subCategories.length > 0 && (

<View style={{ marginTop: 18 }}>

  <FlatList
    horizontal
    showsHorizontalScrollIndicator={false}
    data={subCategories}
    keyExtractor={(item) =>
      item.sub_category_id.toString()
    }

    renderItem={({ item }) => (

      <TouchableOpacity

        onPress={() =>
          setSelectedSubCategory(
            item.sub_category_id
          )
        }

        style={[

          styles.subCategoryCard,

          selectedSubCategory ===
          item.sub_category_id && {

            backgroundColor:
              "#F97316",

          },

        ]}
      >

        <Text
          style={{

            color:
              selectedSubCategory ===
              item.sub_category_id
                ? "#fff"
                : "#111",

            fontWeight: "700",

          }}
        >
          {item.name}
        </Text>

      </TouchableOpacity>

    )}
  />

</View>

)}
 
      </ScrollView>

    </View>
    </View>

  );

}



// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F3F4F6",
  },



  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },



  menu: {
    fontSize: 24,
    marginRight: 15,
    color: "#111827",
  },



  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },



  heading: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginTop: 10,
    marginBottom: 10,
  },



  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },



  viewAll: {
    color: "#2563EB",
    fontWeight: "700",
  },



  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
  },



 eventCard: {
  width: 220,
  height: 300,
  borderRadius: 22,
  overflow: "hidden",
  marginRight: 16,
  backgroundColor: "#fff",
},



  image: {
  width: "100%",
  height: "100%",
},


  eventContent: {
    padding: 15,
  },



  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

 
  eventDate: {
    marginTop: 8,
    color: "#6B7280",
  },

 

  eventDistance: {
    marginTop: 6,
    color: "#2563EB",
    fontWeight: "600",
  },
  topHeader: {
  backgroundColor: "#F97316",
  padding: 18,
  paddingTop:35,
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  marginBottom: 18,
},

topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

location: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
},

walletBox: {
  backgroundColor: "rgba(86, 5, 5, 0.98)",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 12,
},

walletText: {
  color: "#fff",
  fontWeight: "700",
},

searchBar: {
  marginTop: 18,
  backgroundColor: "#fff",
  borderRadius: 14,
  height: 52,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
},

searchPlaceholder: {
  color: "#666",
  fontSize: 15,
},

searchIcon: {
  fontSize: 20,
},

rangeSection: {
  marginBottom: 22,
},

rangeTitle: {
  fontSize: 22,
  fontWeight: "700",
  marginBottom: 12,
},

rangeTabs: {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
},

activeRange: {
  backgroundColor: "#0EA5E9",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
},

activeRangeText: {
  color: "#fff",
  fontWeight: "700",
},

rangeText: {
  fontWeight: "600",
  color: "#555",
},

categoryCard: {
  width: 100,
  height: 110,
  borderRadius: 20,
  marginRight: 14,
  alignItems: "center",
  justifyContent: "center",
},

categoryImage: {
  width: 42,
  height: 42,
  resizeMode: "contain",
},

categoryName: {
  marginTop: 10,
  fontWeight: "700",
  textAlign: "center",
  fontSize: 13,
},
rangeWrapper: {
  backgroundColor: "#fff",
  marginBottom: 5,
  padding: 15,
  borderRadius: 18,
},

rangeHeading: {
  fontSize: 22,
  fontWeight: "700",
},

rangeLabel: {
  marginTop: 0,
  fontWeight: "600",
  color: "#444",
},
 
 
 

 

overlay: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  justifyContent: "space-between",
  padding: 0,
},

featuredBadge: {
  alignSelf: "flex-end",
  backgroundColor: "#F97316",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 25,
  marginRight: 5,
  marginTop: 5,
},

featuredText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 12,
},

bottomContent: {
  backgroundColor: "rgba(0,0,0,0.45)",
  padding: 12,
  borderRadius: 16,
},

overlayTitle: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "700",
},

overlayDate: {
  color: "#fff",
  marginTop: 6,
},

overlayDistance: {
  color: "#fff",
  marginTop: 5,
  fontWeight: "600",
},
subCategoryCard: {
  backgroundColor: "#fff",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 30,
  marginRight: 10,
  elevation: 2,
},

searchDropdown: {
  backgroundColor: "#fff",
  borderRadius: 16,
  marginTop: 8,
  overflow: "hidden",
},

searchItem: {
  padding: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

});