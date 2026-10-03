import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  getCategories,
  getCities,
  getStates,
  getSubCategories,
  partnerAddBusiness,
} from "../../api/api";

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export default function AddBusiness() {
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [cameraLoading, setCameraLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false); 

  const [currentTag, setCurrentTag] = useState("");
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Modals Visibility & Search States
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    address: "",
    city: "",          // Database City ID
    city_name: "",     // UI display
    state: "",         // Database State ID
    state_name: "",    // UI display
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    category_id: "",
    category_name: "", 
    sub_category_id: "",
    sub_category_name: "", 
    working_from: "", 
    working_to: "",   
    owner_name: "",
    proof_image: null as ImageFile | null,
    icon_url: null as ImageFile | null,
    banner_image: null as ImageFile | null,
    
    // 🔹 Hidden Parameters for API Integration
    display_name: "",
    road: "",
    suburb: "",
    village: "",
    county: "",
    state_district: "",
    postcode: "",      // UI पर भी डिस्प्ले होगा
    country: "",
    country_code: ""
  });

  useEffect(() => {
    loadCategories();
    loadStates();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const loadSubCategories = async (id: any) => {
    try {
      const res = await getSubCategories(id);
      setSubCategories(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const loadStates = async () => {
    try {
      const res = await getStates();
      const stateList = res.data.data || [];
      setStates(stateList);
    } catch (e) {
      console.log(e);
    }
  };

  const loadCities = async (stateId: any) => {
    try {
      const res = await getCities(stateId);
      const cityList = res.data.data || [];
      setCities(cityList);
      return cityList;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const handleTagInput = (text: string) => {
  // अगर यूजर कॉमा (,) टाइप करता है, तो उसे तुरंत टैग बना दें
  if (text.endsWith(",")) {
    const cleanTag = text.replace(",", "").trim();
    if (cleanTag && !tagsArray.includes(cleanTag)) {
      setTagsArray([...tagsArray, cleanTag]);
    }
    setCurrentTag("");
  } else {
    setCurrentTag(text);
  }
};

const addTagOnEnter = () => {
  const cleanTag = currentTag.trim();
  if (cleanTag && !tagsArray.includes(cleanTag)) {
    setTagsArray([...tagsArray, cleanTag]);
  }
  setCurrentTag("");
};

  const removeTag = (indexToRemove: number) => {
    setTagsArray(tagsArray.filter((_, index) => index !== indexToRemove));
  };

  const onTimeFromChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      setForm(prev => ({ ...prev, working_from: `${hours}:${minutes}` }));
    }
  };

  const onTimeToChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      setForm(prev => ({ ...prev, working_to: `${hours}:${minutes}` }));
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "Select Time";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const pickImage = async (field: "proof_image" | "icon_url" | "banner_image") => {
    if (cameraLoading) return;
    setCameraLoading(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "We need access to your camera to take live photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const localUri = asset.uri;

        const filename = localUri.split('/').pop() || `cam_${field}_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : "image/jpeg";

        setForm((prev) => ({
          ...prev,
          [field]: {
            uri: localUri,
            name: filename,
            type: mimeType,
          },
        }));
      }
    } catch (e) {
      console.log("Camera capture error: ", e);
      Alert.alert("Error", "Failed to capture photo from camera");
    } finally {
      setCameraLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      setGeoLoading(true);
      const location = await getUserLocation();
      if (!location) {
        Alert.alert("Location denied", "Please enable your GPS permissions.");
        setGeoLoading(false);
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1`,
        { headers: { 'User-Agent': 'NearbyAppPartnerSystem' } }
      );
      const json = await response.json();

      let detectedCityName = "";
      let detectedStateName = "";
      let matchedStateId = "";
      let matchedCityId = "";

      if (json && json.address) {
        detectedCityName = json.address.city || json.address.district || json.address.town || json.address.state_district || "";
        detectedStateName = json.address.state || "";

        const stateMatch = states.find(
          (s) => s.name && s.name.toLowerCase().replace(/\s+/g, '') === detectedStateName.toLowerCase().replace(/\s+/g, '')
        );

        if (stateMatch) {
          matchedStateId = String(stateMatch.id);
          
          const cityList = await loadCities(stateMatch.id);
          const cityMatch = cityList.find(
            (c: any) => c.name && c.name.toLowerCase().replace(/\s+/g, '') === detectedCityName.toLowerCase().replace(/\s+/g, '')
          );
          if (cityMatch) {
            matchedCityId = String(cityMatch.id);
          }
        }
      }

      setForm((prev) => ({
        ...prev,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        state: matchedStateId || prev.state, 
        state_name: detectedStateName || "Uttar Pradesh",
        city: matchedCityId || prev.city, 
        city_name: detectedCityName || "Agra",
        
        // 🔹 Storing New OpenStreetMap Metadata
        display_name: json.display_name || "",
        road: json.address?.road || "",
        suburb: json.address?.suburb || "",
        village: json.address?.village || "",
        county: json.address?.county || "",
        state_district: json.address?.state_district || "",
        postcode: json.address?.postcode || "",
        country: json.address?.country || "",
        country_code: json.address?.country_code || ""
      }));

      Alert.alert(
        "Location Sync Successfully ✅", 
        `Coordinates & Region locked effectively!\n📍 ${detectedCityName || 'Agra'}, ${detectedStateName || 'Uttar Pradesh'}`
      );

    } catch (e) {
      console.log("GPS Auto Fetch Error: ", e);
      Alert.alert("Error", "GPS capture completed, but region auto-matching failed.");
    } finally {
      setGeoLoading(false);
    }
  };

  const submit = async () => {
    try {
      if (!form.business_name || !form.phone || !form.address || !form.category_id || !form.state || !form.city) {
        Alert.alert("Error", "Please fill all required fields (*) and lock live location.");
        return;
      }

      if (tagsArray.length < 2) {
        Alert.alert(
          "Tags Required *", 
          `Please add at least 2 tags/specialities for this business (You have added ${tagsArray.length}).`
        );
        return;
      }

      if (!form.icon_url || !form.icon_url.uri) {
        Alert.alert("Logo Required", "Please capture the service provider or shop photo before submitting.");
        return;
      }

      setLoading(true);
      const userRaw = await AsyncStorage.getItem("user");
      const user: any = JSON.parse(userRaw || "{}");

      if (!user || !user.id) {
        Alert.alert("Error", "User session not found. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      formData.append("user_id", String(user.id));
      formData.append("business_name", String(form.business_name).trim());
      formData.append("address", String(form.address).trim());
      formData.append("phone", String(form.phone).trim());
      formData.append("email", String(form.email || "").trim());
      formData.append("owner_name", String(form.owner_name || "").trim());
      
      formData.append("tags", tagsArray.join(',')); 

      formData.append("category_id", String(form.category_id));
      formData.append("sub_category_id", form.sub_category_id ? String(form.sub_category_id) : "");

      formData.append("state", String(form.state)); 
      formData.append("city", String(form.city));   
      formData.append("latitude", String(form.latitude));
      formData.append("longitude", String(form.longitude));
      formData.append("working_from", String(form.working_from || ""));
      formData.append("working_to", String(form.working_to || ""));

      // 🔹 Appending new location fields securely for backend processing
      formData.append("display_name", String(form.display_name || ""));
      formData.append("road", String(form.road || ""));
      formData.append("suburb", String(form.suburb || ""));
      formData.append("village", String(form.village || ""));
      formData.append("county", String(form.county || ""));
      formData.append("state_district", String(form.state_district || ""));
      formData.append("postcode", String(form.postcode || ""));
      formData.append("country", String(form.country || ""));
      formData.append("country_code", String(form.country_code || ""));

      if (form.proof_image && form.proof_image.uri) {
        formData.append("proof_image", {
          uri: form.proof_image.uri,
          name: form.proof_image.name || "proof.jpg",
          type: form.proof_image.type || "image/jpeg",
        } as any);
      }

      formData.append("icon_url", {
        uri: form.icon_url.uri,
        name: form.icon_url.name || "logo.jpg",
        type: form.icon_url.type || "image/jpeg",
      } as any);

      if (form.banner_image && form.banner_image.uri) {
        formData.append("banner_image", {
          uri: form.banner_image.uri,
          name: form.banner_image.name || "banner.jpg",
          type: form.banner_image.type || "image/jpeg",
        } as any);
      }

      console.log("Sending clean FormData packets to API...");
      const res = await partnerAddBusiness(formData);

      if (res.data.status) {
        setForm({
          business_name: "",
          address: "",
          city: "",
          city_name: "",
          state: "",
          state_name: "",
          latitude: "",
          longitude: "",
          phone: "",
          email: "",
          category_id: "",
          category_name: "",
          sub_category_id: "",
          sub_category_name: "",
          working_from: "",
          working_to: "",
          owner_name: "",
          proof_image: null,
          icon_url: null,
          banner_image: null,
          display_name: "",
          road: "",
          suburb: "",
          village: "",
          county: "",
          state_district: "",
          postcode: "",
          country: "",
          country_code: ""
        });
        setTagsArray([]); 

        Alert.alert("Success", res.data.message || "Business onboarding profile submitted!", [
          {
            text: "OK",
            onPress: () => {
              router.push("/partner/my-businesses");
            }
          }
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Failed to submit business profile");
      }
    } catch (e: any) {
      console.log("CRITICAL ERROR => ", e?.response?.data || e?.message || e);
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const SearchableModal = ({
    visible,
    onClose,
    data,
    onSelect,
    placeholder,
    title
  }: {
    visible: boolean;
    onClose: () => void;
    data: any[];
    onSelect: (item: any) => void;
    placeholder: string;
    title: string;
  }) => {
    const [localSearch, setLocalSearch] = useState("");
    const [modalQuery, setModalQuery] = useState("");

    useEffect(() => {
      if (!visible) {
        setLocalSearch("");
        setModalQuery("");
        return;
      }
      
      const delayDebounceFn = setTimeout(() => {
        setModalQuery(localSearch);
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    }, [localSearch, visible]);

    const filteredData = data.filter((item) =>
      item.name && item.name.toLowerCase().includes(modalQuery.toLowerCase())
    );

    return (
      <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: "#fff" }} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.fixedModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => { setLocalSearch(""); setModalQuery(""); onClose(); }}>
                <Ionicons name="close" size={26} color="#1E293B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSearchBox}>
              <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={localSearch}
                onChangeText={setLocalSearch}
              />
              {localSearch ? (
                <TouchableOpacity onPress={() => { setLocalSearch(""); setModalQuery(""); }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

           <FlatList
  data={filteredData}
  // 🚀 FIXED: Combines id context with index to guarantee absolute uniqueness
  keyExtractor={(item, index) => {
    const id = item.category_id || item.sub_category_id || item.id || '';
    return `${id}-${index}`;
  }}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.modalItemRow}
      onPress={() => {
        onSelect(item);
        setLocalSearch("");
        setModalQuery("");
        onClose();
      }}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  )}
  ListEmptyComponent={
    <Text style={styles.modalEmptyText}>No items found matching your search.</Text>
  }
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{ paddingBottom: 20 }}
/>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="briefcase-outline" size={24} color="#fff" />
          <Text style={styles.menu}>Add Business</Text>
        </View>
        <Text style={styles.subTitle}>Earn revenue by adding completely verified businesses</Text>
      </View>

      <ScrollView
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>

          <Text style={styles.sectionHeader}>📋 General Information</Text>

          <Text style={styles.label}>Business Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="e.g. Reliance Smart"
              placeholderTextColor="#94A3B8"
              value={form.business_name}
              onChangeText={(t) => setForm((prev) => ({ ...prev, business_name: t }))}
            />
          </View>

          <Text style={styles.label}>Owner Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Full Name of Enterprise Owner"
              placeholderTextColor="#94A3B8"
              value={form.owner_name}
              onChangeText={(t) => setForm((prev) => ({ ...prev, owner_name: t }))}
            />
          </View>

          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="10-digit primary number"
              placeholderTextColor="#94A3B8"
              value={form.phone}
              onChangeText={(t) => setForm((prev) => ({ ...prev, phone: t }))}
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="name@business.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm((prev) => ({ ...prev, email: t }))}
            />
          </View>

          <Text style={styles.label}>Address *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginTop: 12 }} />
            <TextInput
              multiline
              style={[styles.input, styles.textArea]}
              placeholder="Shop No, Street, Landmark details..."
              placeholderTextColor="#94A3B8"
              value={form.address}
              onChangeText={(t) => setForm((prev) => ({ ...prev, address: t }))}
            />
          </View>

          <Text style={styles.label}>Business Tags / Specialities (Min 2 Tags Required) *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="pricetags-outline" size={18} color="#64748B" />
            <TextInput
             style={styles.input}
            placeholder="e.g. offset printing, flex banner (Press Enter or Comma)"
            placeholderTextColor="#94A3B8"
            value={currentTag}
            onChangeText={handleTagInput}
            onSubmitEditing={addTagOnEnter} // Enter दबाने पर टैग ऐड होगा
            blurOnSubmit={false}            // Enter दबाने पर कीबोर्ड बंद नहीं होगा
            returnKeyType="done"
            />
          </View>
          
          {tagsArray.length > 0 && (
            <View style={styles.tagsContainer}>
              {tagsArray.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)} style={styles.tagCloseBtn}>
                    <Ionicons name="close-circle" size={16} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionHeader}>📂 Categorization</Text>

          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity 
                style={styles.selectorContainer} 
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={[styles.selectorText, !form.category_name && styles.placeholderColor]} numberOfLines={1}>
                  {form.category_name || "Select Category"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>Service Type</Text>
              <TouchableOpacity 
                style={styles.selectorContainer} 
                onPress={() => {
                  if (!form.category_id) {
                    Alert.alert("Alert", "Please select a category first.");
                    return;
                  }
                  setSubCategoryModalVisible(true);
                }}
              >
                <Text style={[styles.selectorText, !form.sub_category_name && styles.placeholderColor]} numberOfLines={1}>
                  {form.sub_category_name || "Select Type"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionHeader}>🕒 Working Hours</Text>
          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>Opening Time</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowFromPicker(true)}>
                <Ionicons name="time-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={styles.timeButtonText}>{formatDisplayTime(form.working_from)}</Text>
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeFromChange}
                />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>Closing Time</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowToPicker(true)}>
                <Ionicons name="time-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={styles.timeButtonText}>{formatDisplayTime(form.working_to)}</Text>
              </TouchableOpacity>
              {showToPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeToChange}
                />
              )}
            </View>
          </View>

          <Text style={styles.sectionHeader}>📸 Live Camera Verification</Text>

          <Text style={styles.label}>Service Provider/shop photo (Take Live Photo) *</Text>
          <TouchableOpacity
            style={[styles.imagePicker, form.icon_url ? styles.imagePickerActive : null]}
            onPress={() => pickImage("icon_url")}
          >
            <Ionicons name={form.icon_url ? "camera" : "camera-outline"} size={20} color={form.icon_url ? "#16A34A" : "#2563EB"} />
            <Text style={[styles.imageText, form.icon_url ? styles.imageTextSelected : null]}>
              {form.icon_url ? "Retake Logo Photo" : "Open Camera & Capture Logo"}
            </Text>
          </TouchableOpacity>
          {form.icon_url && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: form.icon_url.uri }} style={styles.previewImage} />
            </View>
          )}

          <Text style={styles.label}>Main Store Frontage (Take Live Photo)</Text>
          <TouchableOpacity
            style={[styles.imagePicker, form.banner_image ? styles.imagePickerActive : null]}
            onPress={() => pickImage("banner_image")}
          >
            <Ionicons name={form.banner_image ? "camera" : "camera-outline"} size={20} color={form.banner_image ? "#16A34A" : "#2563EB"} />
            <Text style={[styles.imageText, form.banner_image ? styles.imageTextSelected : null]}>
              {form.banner_image ? "Retake Banner Photo" : "Open Camera & Capture Frontage"}
            </Text>
          </TouchableOpacity>
          {form.banner_image && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: form.banner_image.uri }} style={styles.previewImage} />
            </View>
          )}

          <Text style={styles.label}>Proof Document (Business Card & Selfie with Owner)</Text>
          <TouchableOpacity
            style={[styles.imagePicker, form.proof_image ? styles.imagePickerActive : null]}
            onPress={() => pickImage("proof_image")}
          >
            <Ionicons name={form.proof_image ? "camera" : "camera-outline"} size={20} color={form.proof_image ? "#16A34A" : "#2563EB"} />
            <Text style={[styles.imageText, form.proof_image ? styles.imageTextSelected : null]}>
              {form.proof_image ? "Retake Document Photo" : "Open Camera & Capture Proof"}
            </Text>
          </TouchableOpacity>
          {form.proof_image && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: form.proof_image.uri }} style={styles.previewImage} />
            </View>
          )}

          <Text style={styles.sectionHeader}>📍 Geolocation Tracking</Text>

          <TouchableOpacity 
            style={[styles.locationButton, geoLoading && { backgroundColor: '#047857' }]} 
            onPress={getLocation} 
            disabled={geoLoading}
            activeOpacity={0.8}
          >
            {geoLoading ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="navigate" size={18} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.locationButtonText}>
              {geoLoading ? "Fetching Region & GPS..." : "Lock Live GPS Location"}
            </Text>
          </TouchableOpacity>

          {/* 🔹 NEW & COMPACT REGION CONTAINER: कोऑर्डिनेट्स के साथ ही सिटी, स्टेट और पोस्टकोड लाइव दिखेंगे */}
          {form.latitude && form.longitude ? (
            <View style={styles.locationBox}>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Latitude:</Text>
                <Text style={styles.coordValue}>{parseFloat(form.latitude).toFixed(5)}</Text>
              </View>
              <View style={[styles.coordRow, { marginTop: 4 }]}>
                <Text style={styles.coordLabel}>Longitude:</Text>
                <Text style={styles.coordValue}>{parseFloat(form.longitude).toFixed(5)}</Text>
              </View>
              
              <View style={styles.locationDivider} />
              
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Detected City:</Text>
                <Text style={[styles.coordValue, { color: "#2563EB" }]}>{form.city_name || "Agra"}</Text>
              </View>
              <View style={[styles.coordRow, { marginTop: 4 }]}>
                <Text style={styles.coordLabel}>Detected State:</Text>
                <Text style={[styles.coordValue, { color: "#2563EB" }]}>{form.state_name || "Uttar Pradesh"}</Text>
              </View>
              <View style={[styles.coordRow, { marginTop: 4 }]}>
                <Text style={styles.coordLabel}>Postcode / Pin:</Text>
                <Text style={[styles.coordValue, { color: "#F97316" }]}>{form.postcode || "282001"}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={submit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Onboarding Profile 🚀</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CATEGORY MODAL */}
      <SearchableModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        data={categories}
        title="Select Category"
        placeholder="Type here to search..."
        onSelect={(item) => {
          setForm((prev) => ({ 
            ...prev, 
            category_id: String(item.category_id),
            category_name: item.name,
            sub_category_id: "", 
            sub_category_name: ""
          }));
          loadSubCategories(item.category_id);
        }}
      />

      {/* SUB-CATEGORY MODAL */}
      <SearchableModal
        visible={subCategoryModalVisible}
        onClose={() => setSubCategoryModalVisible(false)}
        data={subCategories}
        title="Select Service Type"
        placeholder="Type here to search..."
        onSelect={(item) => {
          setForm((prev) => ({ 
            ...prev, 
            sub_category_id: String(item.sub_category_id),
            sub_category_name: item.name
          }));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topHeader: { backgroundColor: "#2563EB", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  menu: { color: "#fff", fontSize: 20, fontWeight: "700", marginLeft: 10 },
  subTitle: { color: "#DBEAFE", marginTop: 8, fontSize: 13, fontWeight: "500", lineHeight: 18 },
  scrollContent: { paddingBottom: 40 },
  formCard: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: -20, borderRadius: 24, padding: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  sectionHeader: { fontSize: 14, fontWeight: "800", color: "#1E3A8A", marginTop: 22, marginBottom: 4, backgroundColor: "#EFF6FF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: "flex-start", overflow: "hidden" },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6, marginTop: 14 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
  textAreaContainer: { height: 90, alignItems: "flex-start" },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: "#1E293B", fontWeight: "500" },
  textArea: { height: "100%", paddingTop: 10, textAlignVertical: "top" },
  rowFields: { flexDirection: "row", justifyContent: "space-between" },
  pickerWrapper: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, height: 52, justifyContent: "center" },
  imagePicker: { height: 52, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  imagePickerActive: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  imageText: { color: "#2563EB", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  imageTextSelected: { color: "#16A34A" },
  previewContainer: { marginTop: 8, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", padding: 6 },
  previewImage: { width: "100%", height: 140, borderRadius: 10, resizeMode: "cover" },
  locationButton: { flexDirection: "row", backgroundColor: "#059669", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 12 },
  locationButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  locationBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#DCFCE7", borderRadius: 14, padding: 14, marginTop: 12 },
  locationDivider: { height: 1, backgroundColor: "#DCFCE7", marginVertical: 8 }, // 🔹 Added Divider style
  coordRow: { flexDirection: "row", justifyContent: "space-between" },
  coordLabel: { color: "#166534", fontWeight: "600", fontSize: 13 },
  coordValue: { color: "#14532D", fontWeight: "700", fontSize: 13 },
  button: { backgroundColor: "#2563EB", height: 54, borderRadius: 14, justifyContent: "center", alignItems: 'center', marginTop: 26, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  tagChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 10, paddingLeft: 10, paddingRight: 6, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: "700", color: "#1D4ED8" },
  tagCloseBtn: { marginLeft: 6 },
  timeButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
  timeButtonText: { fontSize: 14, color: "#1E293B", fontWeight: "600" },

  selectorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
  selectorText: { fontSize: 14, color: "#1E293B", fontWeight: "500", flex: 1, marginRight: 4 },
  placeholderColor: { color: "#94A3B8" },
  
  fixedModalContent: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "ios" ? 45 : 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  modalSearchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, marginHorizontal: 20, marginTop: 14, marginBottom: 12, paddingHorizontal: 12, height: 46 },
  modalSearchInput: { flex: 1, fontSize: 14, color: "#1E293B", paddingVertical: 0 },
  modalItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  modalItemText: { fontSize: 14, color: "#334155", fontWeight: "500" },
  modalEmptyText: { textAlign: "center", color: "#64748B", marginTop: 30, fontSize: 14, paddingHorizontal: 20 }
});