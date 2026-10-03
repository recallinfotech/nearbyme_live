import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { applyPartner } from "../../api/api";

export default function ApplyPartner() {
  const [upi, setUpi] = useState('');
  const [city, setCity] = useState('');
  const [aadhaar, setAadhaar] = useState<any>(null);
  const [selfie, setSelfie] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [upiFocused, setUpiFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  const pickImage = async (type: string) => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to capture documents.');
      return;
    }

    const res: any = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      if (type === 'aadhaar') {
        setAadhaar(res.assets[0]);
      } else {
        setSelfie(res.assets[0]);
      }
    }
  };

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/partner');
    }
  };

  const submit = async () => {
    if (!upi.trim() || !city.trim() || !aadhaar || !selfie) {
      Alert.alert('Required Fields', 'Please fill all details and capture both verification documents.');
      return;
    }

    try {
      setLoading(true);
      const userRaw = await AsyncStorage.getItem('user');
      const user: any = JSON.parse(userRaw || '{}');

      if (!user || !user.id) {
        Alert.alert('Authentication Error', 'User session not found. Please log in again.');
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('user_id', String(user.id));
      form.append('upi_id', upi.trim());
      form.append('city', city.trim());

      // ✅ स्मार्ट एंड्रॉइड इमेज ऑब्जेक्ट पार्सर (नेटवर्क एरर फिक्स)
      if (aadhaar) {
        const localUri = aadhaar.uri;
        const filename = localUri.split('/').pop() || 'aadhaar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        form.append('aadhaar_image', {
          uri: localUri,
          name: filename,
          type: type
        } as any);
      }

      if (selfie) {
        const localUri = selfie.uri;
        const filename = localUri.split('/').pop() || 'selfie.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        form.append('selfie_image', {
          uri: localUri,
          name: filename,
          type: type
        } as any);
      }

      // 📜 सबमिशन लॉग्स
      console.log("Submitting Request...");

      const res = await applyPartner(form);

      // अगर बैकएंड से जवाब सही आता है
      if (res.data?.status) {
        Alert.alert('Application Received', res.data?.message || 'Your onboarding application has been submitted.', [
          {
            text: 'OK',
            onPress: () => {
              handleBackNavigation();
            }
          }
        ]);
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to submit application.');
      }

    } catch (e: any) {
      console.log("API Server Error Response Details:", e?.response?.data || e?.message || e);
      const serverMessage = e?.response?.data?.message || e?.message;
      Alert.alert(
        'Submission Failed',
        serverMessage ? `Error: ${serverMessage}` : 'Something went wrong. Please check your network or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButtonCircle} onPress={handleBackNavigation}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Become a Partner</Text>
        </View>
        <Text style={styles.subtitle}>Verify your details to unlock dashboard access & start earning rewards</Text>
      </View>

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: '#3B82F6' }]}>⚡ UPI ID FOR PAYOUTS</Text>
              <TextInput
                placeholder='username@bank'
                placeholderTextColor="#94A3B8"
                value={upi}
                onChangeText={setUpi}
                style={[styles.input, upiFocused && styles.inputActive]}
                onFocus={() => setUpiFocused(true)}
                onBlur={() => setUpiFocused(false)}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: '#8B5CF6' }]}>📍 OPERATING CITY</Text>
              <TextInput
                placeholder='e.g. Mumbai, Delhi'
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={setCity}
                style={[styles.input, cityFocused && styles.inputActive]}
                onFocus={() => setCityFocused(true)}
                onBlur={() => setCityFocused(false)}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <View style={styles.uploadRow}>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.uploadCard, { borderColor: '#DBEAFE' }, aadhaar && styles.uploadCardSuccess]}
              onPress={() => pickImage('aadhaar')}
            >
              {aadhaar ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: aadhaar.uri }} style={styles.thumbnail} />
                  <View style={styles.successBadge}>
                    <Text style={styles.badgeText}>✓ ID Card Saved</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.uploadIcon}>🪪</Text>
                  </View>
                  <Text style={styles.uploadMainText}>Verification Card</Text>
                  <Text style={[styles.uploadSubText, { color: '#3B82F6' }]}>Tap to Scan 🚀</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.uploadCard, { borderColor: '#D1FAE5' }, selfie && styles.uploadCardSuccess]}
              onPress={() => pickImage('selfie')}
            >
              {selfie ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selfie.uri }} style={styles.thumbnail} />
                  <View style={styles.successBadge}>
                    <Text style={styles.badgeText}>✓ Selfie Saved</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={[styles.iconWrapper, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={styles.uploadIcon}>📸</Text>
                  </View>
                  <Text style={styles.uploadMainText}>Live Selfie</Text>
                  <Text style={[styles.uploadSubText, { color: '#10B981' }]}>Tap to Capture ⚡</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing Onboarding...' : 'Submit Application 🚀'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F1F5F9' },
  headerContainer: { backgroundColor: '#1E40AF', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8, shadowColor: '#1E40AF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButtonCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backButtonIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#93C5FD', lineHeight: 18, fontWeight: '500', paddingLeft: 48 },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingVertical: 24 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 16, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, fontWeight: '600', color: '#0F172A' },
  inputActive: { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 14, paddingLeft: 4 },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  uploadCard: { width: '48%', height: 155, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.03, shadowRadius: 12 },
  uploadCardSuccess: { borderColor: '#10B981', borderWidth: 2.5 },
  uploadPlaceholder: { alignItems: 'center', padding: 8 },
  iconWrapper: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  uploadIcon: { fontSize: 24 },
  uploadMainText: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  uploadSubText: { fontSize: 11, fontWeight: '700' },
  previewContainer: { width: '100%', height: '100%' },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  successBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#10B981', paddingVertical: 6, alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  button: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 18, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4 },
  buttonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});