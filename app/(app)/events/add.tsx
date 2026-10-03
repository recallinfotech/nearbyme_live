import { getUserLocation } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 Premium Gradient Headers
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { addEvent, getEventCategories, getEventPackages } from "../../api/api";
import WalletButton from "../../components/WalletButton";

const AddEvent = () => {
  const navigation = useNavigation<any>();

  const [packages, setPackages] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [durationDays, setDurationDays] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState<any>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    loadCategories();
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await getEventPackages();
      setPackages(res.data.data || []);
    } catch (e) {
      console.log("Package Load Error:", e);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getEventCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.log("Category Load Error:", error);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "We need camera roll permissions to upload the banner.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.3,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage({ uri: asset.uri });
      }
    } catch (e) {
      console.log("Image Pick Error:", e);
    }
  };

  const getLocation = async () => {
    try {
      const location = await getUserLocation();
      if (!location) {
        Alert.alert("Location Error", "Location permission denied or unavailable.");
        return;
      }
      setLatitude(location.lat.toString());
      setLongitude(location.lng.toString());
      Alert.alert("Success", "Location fetched successfully");
    } catch (e) {
      console.log("Location Fetch Error:", e);
    }
  };

  const submitEvent = async () => {
    if (!selectedPackage) {
      Alert.alert("Validation Error", "Please select a promotion package.");
      return;
    }

    let user;
    try {
      user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
    } catch (e) {
      user = {};
    }

    if (!user?.id) {
      Alert.alert("Auth Error", "Login is required to add an event.");
      return;
    }

    if (!categoryId) {
      Alert.alert("Validation Error", "Please select an event category.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter an event title.");
      return;
    }

    if (!eventDate) {
      Alert.alert("Validation Error", "Please select an event date.");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Validation Error", "Please fetch your current location coordinates.");
      return;
    }

    const formData = new FormData();
    formData.append("package_id", selectedPackage?.id?.toString());
    formData.append("duration_days", durationDays.toString());
    formData.append("category_id", categoryId.toString());
    formData.append("user_id", user.id.toString());
    formData.append("title", title);
    formData.append("description", description);
    formData.append("event_date", eventDate);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    if (image && image.uri) {
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: Platform.OS === "android" ? image.uri : image.uri.replace("file://", ""),
        type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        name: `event.${fileType === 'png' ? 'png' : 'jpg'}`,
      } as any);
    }

    try {
      const response = await addEvent(formData);

      Alert.alert(
        response.data.status ? "Success" : "Failed",
        response.data.message,
        [
          {
            text: "OK",
            onPress: () => {
              if (response.data.status) {
                setCategoryId("");
                setTitle("");
                setDescription("");
                setEventDate("");
                setImage(null);
                setLatitude("");
                setLongitude("");
                setSelectedPackage(null);
                setDurationDays(1);
                router.replace("/profile");
              }
            }
          }
        ]
      );

    } catch (error) {
      console.log("Submit Event Error:", error);
      Alert.alert("Network Error", "Something went wrong while uploading the event.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर (Space issue fixed) */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.topHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Text style={styles.menu}>☰ Create Event</Text>
          </TouchableOpacity>
          <WalletButton />
        </View>
        <Text style={styles.subTitle}>Promote and launch your event nearby</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

        <Text style={styles.label}>Event Category</Text>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={categoryId}
            onValueChange={(val) => setCategoryId(String(val))}
            style={styles.pickerElement}
          >
            <Picker.Item label="Select Event Category" value="" textColor="#94A3B8" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id.toString()} label={cat.name} value={cat.id.toString()} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Event Title</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="document-text" size={18} color="#6B38FB" style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Event Title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputContainer, { alignItems: "flex-start", paddingTop: 12, height: 120 }]}>
          <Ionicons name="create" size={18} color="#6B38FB" style={[styles.inputIcon, { marginTop: 2 }]} />
          <TextInput
            placeholder="Write event details, instructions, etc..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: '100%', textAlignVertical: "top" }]}
          />
        </View>

        <Text style={styles.label}>Event Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
          <Ionicons name="calendar" size={18} color="#6B38FB" style={styles.inputIcon} />
          <Text style={[styles.dateText, { color: eventDate ? "#1E293B" : "#94A3B8" }]}>
            {eventDate || "Select Event Date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={eventDate ? new Date(eventDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                const day = String(selectedDate.getDate()).padStart(2, "0");
                setEventDate(`${year}-${month}-${day}`);
              }
            }}
          />
        )}

        <Text style={styles.label}>Event Banner Image</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageUploadBox}>
          {image && image.uri ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload" size={32} color="#6B38FB" />
              <Text style={styles.uploadBoxText}>Tap to choose a creative banner image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Event Location Coordinates</Text>
        <View style={styles.locationContainer}>
          <View style={styles.locationCoordinates}>
            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Lat:</Text>
              <Text style={styles.coordValue}>{latitude || "Not fetched"}</Text>
            </View>
            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Lng:</Text>
              <Text style={styles.coordValue}>{longitude || "Not fetched"}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={getLocation} style={styles.locationButton}>
            <Ionicons name="location" size={15} color="#fff" />
            <Text style={styles.locationButtonText}>Fetch</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Choose Promotion Package</Text>
        <View style={styles.packageWrap}>
          {packages.map((item) => {
            const isSelected = selectedPackage?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id.toString()}
                onPress={() => setSelectedPackage(item)}
                style={[styles.packageCard, isSelected && styles.activePackageCard]}
              >
                <View style={[styles.radioCircle, isSelected && styles.activeRadioCircle]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.packageName, isSelected && styles.activePackageText]}>
                  {item.name}
                </Text>
                <Text style={[styles.packagePrice, isSelected && styles.activePackagePriceText]}>
                  ₹{item.price_per_day}/day
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Campaign Duration (Days)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="time" size={18} color="#6B38FB" style={styles.inputIcon} />
          <TextInput
            value={String(durationDays)}
            onChangeText={(t) => setDurationDays(Number(t) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {selectedPackage && (
          <View style={styles.totalBox}>
            <Ionicons name="cash" size={20} color="#10B981" />
            <Text style={styles.totalText}>
              Total Budget: ₹{Number(selectedPackage.price_per_day) * Number(durationDays)}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={submitEvent} style={styles.submitButton} activeOpacity={0.9}>
          <Text style={styles.submitButtonText}>Publish Event Live 🚀</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default AddEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // 🌟 Light grey-violet background matched
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36),
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menu: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  subTitle: {
    color: "#E9D5FF",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  scrollPadding: {
    padding: 14,
    paddingBottom: 40,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B38FB", // 🌟 Cohesive brand title label
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 12,
  },
  dropdownWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    marginBottom: 12,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
  },
  pickerElement: {
    width: "100%",
    color: "#1E293B",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E9D5FF", // 🌟 Consistent sleek border inputs
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: '600',
    paddingVertical: 0,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  imageUploadBox: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#6B38FB", // 🌟 Synchronized uploader stroke
    borderRadius: 14,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  uploadPlaceholder: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  uploadBoxText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
    gap: 10,
  },
  locationCoordinates: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    paddingLeft: 4,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  coordValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },
  locationButton: {
    backgroundColor: "#16A34A", // 🌟 Clean green for active fetch trackers
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  packageWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  packageCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    flex: 1,
    minWidth: "46%",
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    position: "relative",
  },
  activePackageCard: {
    borderColor: "#6B38FB",
    backgroundColor: "#F3E8FF", // 🌟 Beautiful targeted selection tint
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  activeRadioCircle: {
    borderColor: "#6B38FB",
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B38FB",
  },
  packageName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  activePackageText: {
    color: "#6B38FB",
  },
  packagePrice: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "600",
  },
  activePackagePriceText: {
    color: "#5B21B6",
  },
  totalBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  totalText: {
    color: "#15803D",
    fontWeight: "800",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#6B38FB", // 🌟 Glowing primary purple button
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#6B38FB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});