import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 प्रीमियम ग्रेडिएंट्स के लिए इम्पोर्ट किया
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
    getProviderDetail,
    getStates,
    getSubCategories,
    partnerUpdateBusiness,
} from "../../../api/api";

const { width } = Dimensions.get("window");

interface ImageFile {
    uri: string;
    name: string;
    type: string;
    isLocal?: boolean;
}

export default function EditBusiness() {
    const { id } = useLocalSearchParams();

    const [categories, setCategories] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);

    const [pageLoading, setPageLoading] = useState(true);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false); 

    const [currentTag, setCurrentTag] = useState("");
    const [tagsArray, setTagsArray] = useState<string[]>([]);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

    const [form, setForm] = useState({
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
        proof_image: null as ImageFile | null,
        icon_url: null as ImageFile | null,
        banner_image: null as ImageFile | null,
        
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

    useEffect(() => {
        initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const initPage = async () => {
        try {
            setPageLoading(true);
            const resCat = await getCategories();
            const allCats = resCat.data.data || [];
            setCategories(allCats);

            const resState = await getStates();
            const allStates = resState.data.data || [];
            setStates(allStates);

            if (id) {
                const resDetail = await getProviderDetail(Number(id));
                const biz = resDetail.data.data || resDetail.data; 

                if (biz) {
                    if (biz.category_id) {
                        loadSubCategories(biz.category_id);
                    }
                    if (biz.state) {
                        await getCities(biz.state).then(res => setCities(res.data.data || []));
                    }

                    if (biz.tags) {
                        setTagsArray(biz.tags.split(',').filter(Boolean));
                    }

                    setForm({
                        business_name: biz.business_name || "",
                        address: biz.address || "",
                        city: String(biz.city || ""),
                        city_name: biz.city_name || "",
                        state: String(biz.state || ""),
                        state_name: biz.state_name || (allStates.find((s:any) => s.id == biz.state)?.name || ""),
                        latitude: String(biz.latitude || ""),
                        longitude: String(biz.longitude || ""),
                        phone: biz.phone || "",
                        email: biz.email || "",
                        category_id: String(biz.category_id || ""),
                        category_name: biz.category_name || (allCats.find((c:any) => c.category_id == biz.category_id)?.name || ""),
                        sub_category_id: String(biz.sub_category_id || ""),
                        sub_category_name: biz.sub_category_name || "",
                        working_from: biz.working_from || "",
                        working_to: biz.working_to || "",
                        owner_name: biz.owner_name || "",
                        
                        proof_image: biz.proof_image ? { uri: biz.proof_image, name: 'old_proof.jpg', type: 'image/jpeg', isLocal: false } : null,
                        icon_url: biz.icon_url ? { uri: biz.icon_url, name: 'old_logo.jpg', type: 'image/jpeg', isLocal: false } : null,
                        banner_image: biz.banner_image ? { uri: biz.banner_image, name: 'old_banner.jpg', type: 'image/jpeg', isLocal: false } : null,
                        
                        display_name: biz.display_name || "",
                        road: biz.road || "",
                        suburb: biz.suburb || "",
                        village: biz.village || "",
                        county: biz.county || "",
                        state_district: biz.state_district || "",
                        postcode: biz.postcode || "",
                        country: biz.country || "",
                        country_code: biz.country_code || ""
                    });
                }
            }
        } catch (e) {
            console.log("Error initializing edit data:", e);
            Alert.alert("Error", "Failed to load business details.");
        } finally {
            setPageLoading(false);
        }
    };

    const loadSubCategories = async (catId: any) => {
        try {
            const res = await getSubCategories(catId);
            setSubCategories(res.data.data || []);
        } catch (e) { console.log(e); }
    };

    const handleTagInput = (text: string) => {
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

        if (field === "icon_url") {
            captureFromCamera(field);
            return;
        }

        Alert.alert(
            "Select Image Source",
            "Choose how you want to upload the image:",
            [
                { text: "📷 Camera", onPress: () => captureFromCamera(field) },
                { text: "🖼️ Gallery", onPress: () => pickFromGallery(field) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const captureFromCamera = async (field: "proof_image" | "icon_url" | "banner_image") => {
        setCameraLoading(true);
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission Denied", "We need camera access.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.6,
            });

            handlePickerResult(result, field);
        } catch (e) {
            Alert.alert("Error", "Failed to capture photo");
        } finally { setCameraLoading(false); }
    };

    const pickFromGallery = async (field: "proof_image" | "icon_url" | "banner_image") => {
        setCameraLoading(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission Denied", "We need gallery access.");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.6,
            });

            handlePickerResult(result, field);
        } catch (e) {
            Alert.alert("Error", "Failed to select image from gallery");
        } finally { setCameraLoading(false); }
    };

    const handlePickerResult = (result: ImagePicker.ImagePickerResult, field: string) => {
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const localUri = asset.uri;
            const filename = localUri.split('/').pop() || `img_${field}_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = match ? `image/${match[1]}` : "image/jpeg";

            setForm((prev) => ({
                ...prev,
                [field]: { uri: localUri, name: filename, type: mimeType, isLocal: true },
            }));
        }
    };

    const submitUpdate = async () => {
        try {
            if (!form.business_name?.trim()) { Alert.alert("Validation Error", "Please enter the Business Name."); return; }
            if (!form.phone?.trim()) { Alert.alert("Validation Error", "Please enter the Phone Number."); return; }
            if (!form.address?.trim()) { Alert.alert("Validation Error", "Please enter the Address."); return; }
            if (!form.category_id) { Alert.alert("Validation Error", "Please select a Category."); return; }
            if (!form.working_from) { Alert.alert("Validation Error", "Please select Opening Time."); return; }
            if (!form.working_to) { Alert.alert("Validation Error", "Please select Closing Time."); return; }
            if (!form.icon_url) { Alert.alert("Validation Error", "Please capture the Service Provider/shop photo."); return; }
            if (!form.latitude || !form.longitude) { Alert.alert("Validation Error", "Missing valid business GPS location coordinates."); return; }

            if (tagsArray.length < 2) {
                Alert.alert("Validation Error", "Please add at least 2 Business Tags / Specialities.");
                return;
            }

            setLoading(true);
            const formData = new FormData();

            formData.append("business_name", String(form.business_name).trim());
            formData.append("phone", String(form.phone).trim());
            formData.append("address", String(form.address).trim());
            formData.append("category_id", String(form.category_id));
            formData.append("working_from", String(form.working_from));
            formData.append("working_to", String(form.working_to));
            formData.append("latitude", String(form.latitude));
            formData.append("longitude", String(form.longitude));
            formData.append("tags", tagsArray.join(',')); 

            if (form.owner_name?.trim()) formData.append("owner_name", String(form.owner_name).trim());
            if (form.email?.trim()) formData.append("email", String(form.email).trim());
            if (form.sub_category_id) formData.append("sub_category_id", String(form.sub_category_id));
            if (form.state) formData.append("state", String(form.state));
            if (form.city) formData.append("city", String(form.city));
            formData.append("display_name", String(form.display_name || ""));
            formData.append("road", String(form.road || ""));
            formData.append("postcode", String(form.postcode || ""));

            if (form.icon_url && form.icon_url.isLocal) {
                formData.append("icon_url", { uri: form.icon_url.uri, name: form.icon_url.name, type: form.icon_url.type } as any);
            }
            if (form.proof_image && form.proof_image.isLocal) {
                formData.append("proof_image", { uri: form.proof_image.uri, name: form.proof_image.name, type: form.proof_image.type } as any);
            }
            if (form.banner_image && form.banner_image.isLocal) {
                formData.append("banner_image", { uri: form.banner_image.uri, name: form.banner_image.name, type: form.banner_image.type } as any);
            }

            console.log("Sending update payload...");
            const res = await partnerUpdateBusiness(Number(id), formData);

            if (res.data.status) {
                Alert.alert("Success ✅", "Business profile updated successfully!", [
                    { text: "OK", onPress: () => router.push("/partner/my-businesses") }
                ]);
            } else {
                Alert.alert("Error", res.data.message || "Failed to update profile");
            }
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Something went wrong");
        } finally { setLoading(false); }
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
                        
                        <View style={[styles.modalSearchBox, { backgroundColor: "#F3E8FF", borderColor: "#E9D5FF" }]}>
                            <Ionicons name="search-outline" size={18} color="#6B38FB" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder={placeholder}
                                placeholderTextColor="#94A3B8"
                                value={localSearch}
                                onChangeText={setLocalSearch}
                            />
                        </View>

                        <FlatList
                            data={filteredData}
                            keyExtractor={(item, index) => `${item.category_id || item.sub_category_id || item.id || index}-${index}`}
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
                                    <Ionicons name="chevron-forward" size={16} color="#6B38FB" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.modalEmptyText}>No items found matching your search.</Text>
                            }
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    if (pageLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF' }}>
                <ActivityIndicator size="large" color="#6B38FB" />
                <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '700' }}>Loading Profile Packets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
            {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर */}
            <LinearGradient
                colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1.2 }}
                style={styles.topHeader}
            >
                <View style={styles.headerTitleRow}>
                    <Ionicons name="briefcase-outline" size={24} color="#fff" />
                    <Text style={styles.menu}>Edit Business</Text>
                </View>
                <Text style={styles.subTitle}>Update completely verified business information profiles</Text>
            </LinearGradient>
        
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
                        <Ionicons name="business-outline" size={18} color="#6B38FB" />
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
                        <Ionicons name="person-outline" size={18} color="#6B38FB" />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name of Enterprise Owner (Optional)"
                            placeholderTextColor="#94A3B8"
                            value={form.owner_name}
                            onChangeText={(t) => setForm((prev) => ({ ...prev, owner_name: t }))}
                        />
                    </View>
        
                    <Text style={styles.label}>Phone Number *</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={18} color="#6B38FB" />
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
                        <Ionicons name="mail-outline" size={18} color="#6B38FB" />
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
                        <Ionicons name="location-outline" size={18} color="#6B38FB" style={{ marginTop: 12 }} />
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
                        <Ionicons name="pricetags-outline" size={18} color="#6B38FB" />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. offset printing, flex banner (Press Enter or Comma)"
                            placeholderTextColor="#94A3B8"
                            value={currentTag}
                            onChangeText={handleTagInput}
                            onSubmitEditing={addTagOnEnter}
                            blurOnSubmit={false}
                            returnKeyType="done"
                        />
                    </View>
                    
                    {tagsArray.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {tagsArray.map((tag, index) => (
                                <View key={index} style={styles.tagChip}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                    <TouchableOpacity onPress={() => removeTag(index)} style={styles.tagCloseBtn}>
                                        <Ionicons name="close-circle" size={16} color="#6B38FB" />
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
                                <Ionicons name="chevron-down" size={16} color="#6B38FB" />
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
                                <Ionicons name="chevron-down" size={16} color="#6B38FB" />
                            </TouchableOpacity>
                        </View>
                    </View>
        
                    <Text style={styles.sectionHeader}>🕒 Working Hours</Text>
                    <View style={styles.rowFields}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Opening Time *</Text>
                            <TouchableOpacity style={styles.timeButton} onPress={() => setShowFromPicker(true)}>
                                <Ionicons name="time-outline" size={18} color="#6B38FB" style={{ marginRight: 6 }} />
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
                            <Text style={styles.label}>Closing Time *</Text>
                            <TouchableOpacity style={styles.timeButton} onPress={() => setShowToPicker(true)}>
                                <Ionicons name="time-outline" size={18} color="#6B38FB" style={{ marginRight: 6 }} />
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
        
                    <Text style={styles.sectionHeader}>📸 Live & Media Verification</Text>
        
                    <Text style={styles.label}>Service Provider/shop photo (Take Live Photo) *</Text>
                    <TouchableOpacity
                        style={[styles.imagePicker, form.icon_url ? styles.imagePickerActive : null]}
                        onPress={() => pickImage("icon_url")}
                    >
                        <Ionicons name={form.icon_url ? "camera" : "camera-outline"} size={20} color={form.icon_url ? "#16A34A" : "#6B38FB"} />
                        <Text style={[styles.imageText, form.icon_url ? styles.imageTextSelected : null]}>
                            {form.icon_url ? "Retake Logo Photo" : "Open Camera & Capture Logo"}
                        </Text>
                    </TouchableOpacity>
                    {form.icon_url && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: form.icon_url.uri }} style={styles.previewImage} />
                        </View>
                    )}
        
                    <Text style={styles.label}>Main Store Frontage (Camera or Gallery)</Text>
                    <TouchableOpacity
                        style={[styles.imagePicker, form.banner_image ? styles.imagePickerActive : null]}
                        onPress={() => pickImage("banner_image")}
                    >
                        <Ionicons name={form.banner_image ? "image" : "image-outline"} size={20} color={form.banner_image ? "#16A34A" : "#6B38FB"} />
                        <Text style={[styles.imageText, form.banner_image ? styles.imageTextSelected : null]}>
                            {form.banner_image ? "Change Frontage Photo" : "Select Frontage Photo / Take Photo"}
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
                        <Ionicons name={form.proof_image ? "image" : "image-outline"} size={20} color={form.proof_image ? "#16A34A" : "#6B38FB"} />
                        <Text style={[styles.imageText, form.proof_image ? styles.imageTextSelected : null]}>
                            {form.proof_image ? "Change Document Photo" : "Select Proof Photo / Take Photo"}
                        </Text>
                    </TouchableOpacity>
                    {form.proof_image && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: form.proof_image.uri }} style={styles.previewImage} />
                        </View>
                    )}
        
                    <Text style={styles.sectionHeader}>📍 Geolocation Tracking</Text>
        
                    <TouchableOpacity 
                        style={[styles.locationButton, { backgroundColor: '#94A3B8' }]} 
                        disabled={true}
                        activeOpacity={1}
                    >
                        <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.locationButtonText}>GPS Coordinates Locked</Text>
                    </TouchableOpacity>
        
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
                                <Text style={[styles.coordValue, { color: "#6B38FB" }]}>{form.city_name}</Text>
                            </View>
                            <View style={[styles.coordRow, { marginTop: 4 }]}>
                                <Text style={styles.coordLabel}>Detected State:</Text>
                                <Text style={[styles.coordValue, { color: "#6B38FB" }]}>{form.state_name}</Text>
                            </View>
                            {form.postcode ? (
                                <View style={[styles.coordRow, { marginTop: 4 }]}>
                                    <Text style={styles.coordLabel}>Postcode / Pin:</Text>
                                    <Text style={[styles.coordValue, { color: "#F97316" }]}>{form.postcode}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}
        
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#6B38FB', shadowColor: '#6B38FB' }]} onPress={submitUpdate} disabled={loading} activeOpacity={0.8}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Onboarding Profile 🚀</Text>}
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
    container: { flex: 1, backgroundColor: "#F5F3FF" }, // 🌟 हल्का सा ग्रे-वॉइलेट बैकग्राउंड
    topHeader: { 
        paddingHorizontal: 20, 
        paddingTop: Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
        paddingBottom: 40, 
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32 
    },
    headerTitleRow: { flexDirection: "row", alignItems: "center" },
    menu: { color: "#fff", fontSize: 20, fontWeight: "700", marginLeft: 10 },
    subTitle: { color: "#E9D5FF", marginTop: 8, fontSize: 13, fontWeight: "500", lineHeight: 18 },
    scrollContent: { paddingBottom: 40 },
    formCard: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: -20, borderRadius: 24, padding: 20, shadowColor: "#6B38FB", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: "#E9D5FF" },
    
    // 🌟 न्यू लाइट पर्पल सेक्शन हेडर
    sectionHeader: { fontSize: 13, fontWeight: "800", color: "#5B21B6", marginTop: 22, marginBottom: 4, backgroundColor: "#F3E8FF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: "flex-start", overflow: "hidden", borderWidth: 0.5, borderColor: "#E9D5FF" },
    label: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6, marginTop: 14 },
    
    // 🌟 इनपुट बॉक्स बॉर्डर मॉडिफिकेशन
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
    textAreaContainer: { height: 90, alignItems: "flex-start" },
    input: { flex: 1, marginLeft: 10, fontSize: 14, color: "#1E293B", fontWeight: "600" },
    textArea: { height: "100%", paddingTop: 10, textAlignVertical: "top" },
    rowFields: { flexDirection: "row", justifyContent: "space-between" },
    
    imagePicker: { height: 52, backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
    imagePickerActive: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    imageText: { color: "#6B38FB", fontSize: 14, fontWeight: "700", marginLeft: 8 },
    imageTextSelected: { color: "#16A34A" },
    previewContainer: { marginTop: 8, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", padding: 6 },
    previewImage: { width: "100%", height: 140, borderRadius: 10, resizeMode: "cover" },
    
    locationButton: { flexDirection: "row", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 12, elevation: 1 },
    locationButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    locationBox: { backgroundColor: "#F0FDF4", borderWidth: 1.5, borderColor: "#BBF7D0", borderRadius: 14, padding: 14, marginTop: 12 },
    locationDivider: { height: 1, backgroundColor: "#DCFCE7", marginVertical: 8 },
    coordRow: { flexDirection: "row", justifyContent: "space-between" },
    coordLabel: { color: "#166534", fontWeight: "700", fontSize: 13 },
    coordValue: { color: "#14532D", fontWeight: "800", fontSize: 13 },
    
    button: { height: 54, borderRadius: 14, justifyContent: "center", alignItems: 'center', marginTop: 26, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    
    tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
    tagChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3E8FF", borderWidth: 1, borderColor: "#E9D5FF", borderRadius: 10, paddingLeft: 10, paddingRight: 6, paddingVertical: 5 },
    tagText: { fontSize: 12, fontWeight: "700", color: "#6B38FB" },
    tagCloseBtn: { marginLeft: 6 },
    timeButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
    timeButtonText: { fontSize: 14, color: "#1E293B", fontWeight: "700" },

    selectorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 52 },
    selectorText: { fontSize: 14, color: "#1E293B", fontWeight: "600", flex: 1, marginRight: 4 },
    placeholderColor: { color: "#94A3B8" },
    
    fixedModalContent: { flex: 1, backgroundColor: "#F5F3FF", paddingTop: Platform.OS === "ios" ? 45 : 15 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E9D5FF", backgroundColor: "#FFF" },
    modalTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    modalSearchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 12, marginHorizontal: 20, marginTop: 14, marginBottom: 12, paddingHorizontal: 12, height: 46, backgroundColor: "#FFF" },
    modalSearchInput: { flex: 1, fontSize: 14, color: "#1E293B", paddingVertical: 0, fontWeight: "600" },
    modalItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#E9D5FF", backgroundColor: "#FFF" },
    modalItemText: { fontSize: 14, color: "#334155", fontWeight: "600" },
    modalEmptyText: { textAlign: "center", color: "#64748B", marginTop: 30, fontSize: 14, paddingHorizontal: 20 }
});