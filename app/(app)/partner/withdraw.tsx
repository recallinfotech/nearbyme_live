import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 प्रीमियम ग्रेडिएंट्स के लिए इम्पोर्ट किया
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { checkPendingWithdraw, partnerDashboard, partnerWithdraw } from "../../api/api";

const { width } = Dimensions.get("window");

export default function Withdraw() {
  const navigation = useNavigation();
  const [upi, setUpi] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasPending, setHasPending] = useState(false); 

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');

      if (!user || !user.id) {
        return;
      }

      const res = await partnerDashboard(user.id);
      setBalance(res?.data?.data?.balance || 0);

      const checkRes = await checkPendingWithdraw(user.id);
      if (checkRes?.data?.has_pending) {
        setHasPending(true);
        setUpi(checkRes?.data?.data?.upi_id || ''); 
      } else {
        setHasPending(false);
      }

    } catch (e) {
      console.log("Withdraw Load Error: ", e);
    } finally {
      setFetching(false);
    }
  };

  const submit = async () => {
    const cleanUpi = upi.trim();
    if (!cleanUpi) {
      Alert.alert('Error', 'Please enter a valid UPI ID');
      return;
    }

    if (balance < 30) {
      Alert.alert('Limit Error', 'Minimum ₹30 balance is required to withdraw.');
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');

      const res = await partnerWithdraw({
        user_id: user.id,
        upi_id: cleanUpi,
      });

      Alert.alert('Success', res?.data?.message || 'Withdraw request submitted successfully!');
      setUpi('');
      load(); 
   } catch (e: any) { 
      Alert.alert(
        'Error',
        (e as any)?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर (अब नो वाइट स्पेस) */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.blueHeader}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Withdraw</Text>
        </View>

        {/* अवेलेबल बैलेंस कार्ड - ग्लासमोर्फिज़्म टच */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {fetching ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ alignSelf: 'flex-start', marginTop: 6 }} />
          ) : (
            <Text style={styles.balance}>₹{Number(balance).toLocaleString('en-IN')}</Text>
          )}
        </View>
      </LinearGradient>

      {/* कंटेंट बॉडी */}
      <View style={styles.bodyContent}>
        
        {/* डायनेमिक स्टेटस बैनर */}
        {hasPending ? (
          <View style={[styles.infoBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Text style={[styles.infoText, { color: '#991B1B' }]}>
              ⏳ Your previous withdrawal request is currently pending. Please wait until admin reviews and approves it before making another request.
            </Text>
          </View>
        ) : (
          <View style={[styles.infoBox, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
            <Text style={[styles.infoText, { color: '#6B38FB' }]}>
              💡 Minimum withdraw amount limit is ₹30. Please ensure your UPI ID is absolutely correct.
            </Text>
          </View>
        )}

        <Text style={styles.inputLabel}>UPI ID</Text>
        <TextInput
          placeholder='example@apl'
          placeholderTextColor="#94A3B8"
          value={upi}
          onChangeText={setUpi}
          style={[styles.input, hasPending && { backgroundColor: '#F1F5F9', color: '#64748B' }]}
          autoCapitalize='none'
          autoCorrect={false}
          editable={!hasPending} 
        />

        <TouchableOpacity
          style={[
            styles.button, 
            (loading || fetching || hasPending) && styles.buttonDisabled,
            hasPending && { backgroundColor: '#64748B', shadowColor: '#64748B' } 
          ]}
          onPress={submit}
          disabled={loading || fetching || hasPending} 
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}> Processing...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {hasPending ? '⏰ Request Already Pending' : 'Request Withdraw'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' }, // 🌟 हल्का सा ग्रे-वॉइलेट बैकग्राउंड
  
  blueHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36),
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: -2 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  balanceLabel: { color: '#E9D5FF', fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  balance: { color: '#fff', fontSize: 32, fontWeight: '800' },
  
  bodyContent: { padding: 20, marginTop: 8 },
  infoBox: { padding: 14, borderRadius: 12, marginBottom: 24, borderWidth: 1.5 },
  infoText: { fontWeight: '700', fontSize: 13, lineHeight: 18 },
  
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, paddingLeft: 2 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#E9D5FF', // थीम मैचिंग लाइट पर्पल बॉर्डर
    marginBottom: 24,
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  
  button: {
    backgroundColor: '#6B38FB', // 🌟 थीम मैचिंग प्राइमरी बटन कलर
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#C084FC', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});