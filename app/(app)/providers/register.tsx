import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getCategories,
  getCities,
  getStates,
  getSubCategories,
  registerProvider,
} from "../../api/api";
import WalletButton from "../../components/WalletButton";

export default function RegisterProvider() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    business_name: "",
    address: "",
    city: "",
    state: "",
    icon_url: null,
    banner_image: null,
    latitude: "",
    longitude: "",
    working_hours: "",
    working_from: "",
    working_to: "",
    phone: "",
    email: "",
    tags: "",
    category_id: "",
    sub_category_id: "",
    is_24x7_available: 0,
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
      console.log("Category error:", e);
    }
  };

  const loadSubCategories = async (categoryId: any) => {
    try {
      const res = await getSubCategories(categoryId);
      setSubCategories(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const loadStates = async () => {
    try {
      const res = await getStates();
      setStates(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const loadCities = async (stateId: any) => {
    try {
      const res = await getCities(stateId);
      setCities(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const pickImage = async (field: "icon_url" | "banner_image") => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "We need access to your photos to upload media.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: field === "banner_image" ? [16, 9] : [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setForm({
          ...form,
          [field]: {
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.png`,
            type: asset.mimeType || "image/png",
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getLocation = async () => {
    const location = await getUserLocation();
    if (!location) {
      Alert.alert("Location permission denied");
      return;
    }

    setForm({
      ...form,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    });
    Alert.alert("Success", "Current location fetched successfully 📍");
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (!user?.id) {
        alert("Login required");
        return;
      }

      if (!form.business_name.trim()) return alert("Please enter business name");
      if (!form.address.trim()) return alert("Please enter address");
      if (!form.phone.trim()) return alert("Please enter phone number");
      if (!form.category_id) return alert("Please select category");
      if (!form.latitude.trim() || !form.longitude.trim()) return alert("Please fetch location coordinates");

      const formData = new FormData();
      formData.append("user_id", user.id.toString());
      formData.append("business_name", form.business_name);
      formData.append("address", form.address);
      formData.append("category_id", form.category_id.toString());
      formData.append("sub_category_id", form.sub_category_id.toString());
      formData.append("city", form.city.toString());
      formData.append("state", form.state.toString());
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      formData.append("working_from", form.working_from);
      formData.append("working_to", form.working_to);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("tags", form.tags);
      formData.append("is_24x7_available", form.is_24x7_available.toString());

      if (form.icon_url) {
        formData.append("icon_url", {
          uri: (form.icon_url as any).uri,
          name: (form.icon_url as any).name,
          type: (form.icon_url as any).type,
        } as any);
      }

      if (form.banner_image) {
        formData.append("banner_image", {
          uri: (form.banner_image as any).uri,
          name: (form.banner_image as any).name,
          type: (form.banner_image as any).type,
        } as any);
      }

      const res = await registerProvider(formData);
      alert(res.data.message);

      if (res.data.status) {
        router.back();
      }
    } catch (e: any) {
      console.log("REGISTER ERROR => ", e?.response?.data || e);
      alert("Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <View style={styles.menuContainer}>
              <Ionicons name="menu-outline" size={26} color="#fff" />
              <Text style={styles.menu}>Register Business</Text>
            </View>
          </TouchableOpacity>
          <WalletButton />
        </View>
        <Text style={styles.subTitle}>Grow your business with Nearby platform</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.formCard}>

          {/* BUSINESS NAME */}
          <Text style={styles.label}>Business Name *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="business-outline" size={18} color="#64748B" />
            <TextInput
              placeholder="e.g. Apex Tech Solutions"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              onChangeText={(t) => setForm({ ...form, business_name: t })}
            />
          </View>

          {/* ADDRESS */}
          <Text style={styles.label}>Full Address *</Text>
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginTop: 12 }} />
            <TextInput
              placeholder="Enter complete store/office address"
              placeholderTextColor="#94A3B8"
              multiline
              style={[styles.input, styles.textArea]}
              onChangeText={(t) => setForm({ ...form, address: t })}
            />
          </View>

          {/* PHONE */}
          <Text style={styles.label}>Contact Phone Number *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={18} color="#64748B" />
            <TextInput
              placeholder="10-digit mobile number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.input}
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />
          </View>

          {/* EMAIL */}
          <Text style={styles.label}>Business Email (Optional)</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#64748B" />
            <TextInput
              placeholder="info@yourbusiness.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              style={styles.input}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
          </View>

          {/* CATEGORY & SERVICE */}
          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.category_id}
                  dropdownIconColor="#64748B"
                  style={styles.picker}
                  onValueChange={(val) => {
                    setForm({ ...form, category_id: val, sub_category_id: "" });
                    loadSubCategories(val);
                  }}
                >
                  <Picker.Item label="Select..." value="" style={styles.pickerPlaceholder} />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.category_id} label={cat.name} value={cat.category_id} style={styles.pickerItem} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Service Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.sub_category_id}
                  dropdownIconColor="#64748B"
                  style={styles.picker}
                  onValueChange={(val) => setForm({ ...form, sub_category_id: val })}
                >
                  <Picker.Item label="Select..." value="" style={styles.pickerPlaceholder} />
                  {subCategories.map((sub) => (
                    <Picker.Item key={sub.sub_category_id} label={sub.name} value={sub.sub_category_id} style={styles.pickerItem} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* STATE & CITY */}
          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>State *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.state}
                  dropdownIconColor="#64748B"
                  style={styles.picker}
                  onValueChange={(val) => {
                    setForm({ ...form, state: val, city: "" });
                    loadCities(val);
                  }}
                >
                  <Picker.Item label="Select..." value="" style={styles.pickerPlaceholder} />
                  {states.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.id} style={styles.pickerItem} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>City *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.city}
                  dropdownIconColor="#64748B"
                  style={styles.picker}
                  onValueChange={(val) => setForm({ ...form, city: val })}
                >
                  <Picker.Item label="Select..." value="" style={styles.pickerPlaceholder} />
                  {cities.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.id} style={styles.pickerItem} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* TAGS */}
          <Text style={styles.label}>Search Tags</Text>
          <View style={styles.inputBox}>
            <Ionicons name="pricetags-outline" size={18} color="#64748B" />
            <TextInput
              placeholder="e.g. salon, spa, haircut"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              onChangeText={(t) => setForm({ ...form, tags: t })}
            />
          </View>

          {/* WORKING HOURS */}
          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Opening Time</Text>
              <View style={styles.inputBox}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <TextInput
                  placeholder="09:00 AM"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  onChangeText={(t) => setForm({ ...form, working_from: t })}
                />
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Closing Time</Text>
              <View style={styles.inputBox}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <TextInput
                  placeholder="08:00 PM"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  onChangeText={(t) => setForm({ ...form, working_to: t })}
                />
              </View>
            </View>
          </View>

          {/* 24x7 AVAILABLE CHECKBOX */}
          <TouchableOpacity
            style={[styles.checkRow, form.is_24x7_available ? styles.checkRowActive : null]}
            onPress={() => setForm({ ...form, is_24x7_available: form.is_24x7_available ? 0 : 1 })}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, form.is_24x7_available ? styles.checkedBox : null]}>
              {form.is_24x7_available ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
            </View>
            <Text style={[styles.checkText, form.is_24x7_available ? styles.checkTextActive : null]}>
              Our Business is Available 24/7
            </Text>
          </TouchableOpacity>

          {/* MEDIA UPLOADS */}
          <Text style={styles.label}>Business Media Assets</Text>
          <View style={styles.rowFields}>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage("icon_url")} activeOpacity={0.7}>
              <Ionicons name={form.icon_url ? "checkmark-circle" : "image-outline"} size={20} color={form.icon_url ? "#10B981" : "#2563EB"} />
              <Text style={[styles.imageText, form.icon_url ? styles.imageTextSelected : null]} numberOfLines={1}>
                {form.icon_url ? "Logo Attached" : "Upload Logo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage("banner_image")} activeOpacity={0.7}>
              <Ionicons name={form.banner_image ? "checkmark-circle" : "images-outline"} size={20} color={form.banner_image ? "#10B981" : "#2563EB"} />
              <Text style={[styles.imageText, form.banner_image ? styles.imageTextSelected : null]} numberOfLines={1}>
                {form.banner_image ? "Banner Attached" : "Upload Banner"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* LOCATION MANAGEMENT */}
          <TouchableOpacity onPress={getLocation} style={styles.locationButton} activeOpacity={0.8}>
            <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.locationButtonText}>Fetch GPS Coordinates</Text>
          </TouchableOpacity>

          {form.latitude && form.longitude ? (
            <View style={styles.locationBox}>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Latitude:</Text>
                <Text style={styles.coordVal}>{parseFloat(form.latitude).toFixed(5)}</Text>
              </View>
              <View style={[styles.coordRow, { marginTop: 4 }]}>
                <Text style={styles.coordLabel}>Longitude:</Text>
                <Text style={styles.coordVal}>{parseFloat(form.longitude).toFixed(5)}</Text>
              </View>
            </View>
          ) : null}

          {/* SUBMIT BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Complete Registration 🚀</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menu: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  subTitle: {
    color: "#DBEAFE",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  scrollPadding: {
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 14,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  textAreaBox: {
    height: 90,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  textArea: {
    height: "100%",
    paddingTop: 10,
    textAlignVertical: "top",
  },
  rowFields: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
  },
  picker: {
    color: "#1E293B",
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
  },
  pickerItem: {
    fontSize: 14,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  checkRowActive: {
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#94A3B8",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  checkTextActive: {
    color: "#1E293B",
  },
  imagePicker: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    marginTop: 2,
    paddingHorizontal: 8,
    marginHorizontal: 2,
  },
  imageText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  imageTextSelected: {
    color: "#10B981",
  },
  locationButton: {
    flexDirection: "row",
    backgroundColor: "#059669",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  locationBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  coordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordLabel: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 13,
  },
  coordVal: {
    color: "#14532D",
    fontWeight: "700",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#2563EB",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});