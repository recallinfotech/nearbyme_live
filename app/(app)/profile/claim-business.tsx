import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router'; // 🔥 useLocalSearchParams Add kiya
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { claimBusinessListing, searchBusinessByPhone, sendOtp } from '../../api/api';

export default function ClaimBusiness() {
  const params = useLocalSearchParams();
  const userPhone = params.userPhone ? String(params.userPhone) : '';

  const [step, setStep] = useState(1); // Step 1: Show Fixed Number & Search, Step 2: Cards & OTP
  const [otp, setOtp] = useState('');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initial Check: Agar background profile sync packet bina number ke open ho jaye
  useEffect(() => {
    if (!userPhone || userPhone.trim() === "") {
      Alert.alert(
        "Phone Missing ⚠️", 
        "Please update your phone number in your profile first.",
        [{ text: "Go Back", onPress: () => router.back() }]
      );
    }
  }, [userPhone]);

  // 1️⃣ Otp Send karna aur un-claimed listings fetch karna
// 1️⃣ Pehle business check hoga, agar milega tabhi OTP jayega
  const handleVerifyPhone = async () => {
    try {
      setLoading(true);
      
      // Step A: Pehle check karo ki is number par koi business listed hai ya nahi
      const bizRes = await searchBusinessByPhone(userPhone).catch(() => null);

      if (bizRes && bizRes.data && bizRes.data.status && bizRes.data.data && bizRes.data.data.length > 0) {
        const matchingBusinesses = bizRes.data.data;
        
        // Step B: Business mil gaya, ab OTP request execute karo
        const otpRes = await sendOtp({ mobile: userPhone });

        if (otpRes && otpRes.data && otpRes.data.status) {
          if (otpRes.data.otp) {
            console.log("Generated Verification Token:", otpRes.data.otp);
          }

          setBusinesses(matchingBusinesses);
          setStep(2); // Move to selection & OTP panel
        } else {
          Alert.alert("Opps!", "Business toh mila par OTP request execute nahi ho payi.");
        }

      } else {
        // Step C: Agar list me koi business nahi aaya, toh block kar do aur OTP mat bhejo
        setBusinesses([]);
        Alert.alert(
          "No Records Found 📦", 
          "Is phone number par koi bhi unclaimed business list me available nahi hai. Kripya sahi business number profile me update karein.",
          [{ text: "OK" }]
        );
      }

    } catch (e) {
      console.log("Init Error: ", e);
      Alert.alert("Server Error", "Kuch samay baad koshish karein.");
    } finally {
    setLoading(false);
    }
  };

  // 2️⃣ Verification Token Match aur Database ownership execution
  const handleFinalClaim = async () => {
    if (!selectedBiz) {
      Alert.alert("Attention", "Pehle card packet select karein.");
      return;
    }
    if (!otp) {
      Alert.alert("Input Required", "OTP fill karna mandatory hai.");
      return;
    }

    try {
      setLoading(true);
      const userObj = await AsyncStorage.getItem('user');
      const user = JSON.parse(userObj || '{}');

      if (!user || !user.id) {
        Alert.alert("Auth Error", "User verification fail.");
        return;
      }

      const res = await claimBusinessListing({
        user_id: user.id,
        provider_id: selectedBiz.provider_id,
        phone: userPhone,
        otp: otp
      });

      if (res && res.data && res.data.status) {
        Alert.alert("Badhai Ho! 🎉", "Business ownership successfully link ho gayi hai.", [
          { text: "Dashboard par chalein", onPress: () => router.replace('/profile/my-claimed-businesses') }
        ]);
      } else {
        Alert.alert("Claim Failed", res.data.message || "Invalid OTP code.");
      }
    } catch (e: any) {
      console.log("Claim Update Error: ", e);
      Alert.alert("Verification Error", e.response?.data?.message || "OTP match nahi hua.");
    } finally {
      setLoading(false);
    }
  };

  const renderBizRow = ({ item }: any) => {
    const isChecked = selectedBiz?.provider_id === item.provider_id;
    const fallbackLogo = 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png';

    return (
      <TouchableOpacity
        style={[styles.bizRow, isChecked && styles.activeBizRow]}
        onPress={() => setSelectedBiz(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.icon_url || fallbackLogo }} style={styles.bizThumb} />
        <View style={styles.bizDetails}>
          <Text style={styles.bizNameText}>{item.business_name}</Text>
          <Text style={styles.catBadge}>📁 {item.category_name || "Service Provider"}</Text>
          <Text style={styles.addressText} numberOfLines={1}>📍 {item.address || "Agra"}</Text>
        </View>
        <Ionicons
          name={isChecked ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={isChecked ? "#10B981" : "#94A3B8"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header Bar */}
      <View style={styles.blueHeader}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Claim My Business</Text>
        </View>
        <Text style={styles.subTitleText}>Listings data ownership sync workflow</Text>
      </View>

      {loading && (
        <View style={styles.blockOverlay}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      )}

      {/* STEP 1 CONTROLLER WINDOW (READ-ONLY DISPLAY) */}
      {step === 1 && (
        <View style={styles.padWrapper}>
          <Text style={styles.fieldLabel}>Verified Profile Phone Number</Text>
          <View style={[styles.inputBar, styles.disabledInputBar]}>
            <Ionicons name="phone-portrait-outline" size={18} color="#94A3B8" />
            <TextInput
              style={[styles.textInput, { color: "#94A3B8" }]}
              value={userPhone}
              editable={false}
            />
            <Ionicons name="lock-closed" size={16} color="#94A3B8" />
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyPhone}>
            <Text style={styles.btnTextText}>Search Listings & Send OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2 VALIDATION MATRIX PANEL */}
      {step === 2 && (
        <View style={{ flex: 1 }}>
          <Text style={styles.listLabelText}>Select Your Matching Card ({businesses.length})</Text>
          
          <FlatList
            data={businesses}
            keyExtractor={(item) => String(item.provider_id)}
            renderItem={renderBizRow}
            contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyCardState}>
                <Text style={styles.emptyTitle}>No Unclaimed Records Found 📦</Text>
                <Text style={styles.emptySubTitle}>Is number par koi partner listings available nahi hain.</Text>
              </View>
            )}
          />

          {businesses.length > 0 && (
            <View style={styles.footerVerificationControl}>
              <Text style={styles.fieldLabel}>Enter Security OTP</Text>
              <View style={styles.inputBar}>
                <Ionicons name="key-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 4-Digit OTP token"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
              <TouchableOpacity style={styles.claimCompleteBtn} onPress={handleFinalClaim}>
                <Text style={styles.btnTextText}>Verify & Secure Handover</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  blueHeader: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  subTitleText: { fontSize: 12, color: '#93C5FD', marginTop: 4 },
  padWrapper: { padding: 20, marginTop: 15 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 16,
  },
  disabledInputBar: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0'
  },
  textInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  actionBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimCompleteBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  btnTextText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  listLabelText: { fontSize: 14, fontWeight: '700', color: '#475569', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  bizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeBizRow: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  bizThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#F1F5F9' },
  bizDetails: { flex: 1, paddingHorizontal: 12 },
  bizNameText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  catBadge: { fontSize: 11, color: '#3B82F6', fontWeight: '600', marginTop: 2 },
  addressText: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  footerVerificationControl: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  emptyCardState: { alignItems: 'center', padding: 40, marginTop: 50 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  emptySubTitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 },
  blockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }
});