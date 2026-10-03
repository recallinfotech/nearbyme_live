import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🛑 Latest, Verified & Unified Emergency Numbers (India Official)
const EMERGENCY_DATA = [
  // --- MAIN EMERGENCY & SECURITY ---
  { id: '1', title: 'Emergency Police (Latest)', subtitle: 'मुख्य पुलिस सहायता नंबर (New Unified)', number: '112', icon: 'shield-half', color: '#BE123C', bg: '#FFE4E6' },
  { id: '2', title: 'Alternate Police Helpline', subtitle: 'पारंपरिक पुलिस सहायता नंबर (Old Number)', number: '100', icon: 'call', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '3', title: 'Medical Ambulance', subtitle: 'एम्बुलेंस आपातकालीन सेवा', number: '108', icon: 'medical', color: '#EF4444', bg: '#FEF2F2' },
  { id: '4', title: 'Fire Brigade', subtitle: 'अग्निशमन विभाग', number: '101', icon: 'flame', color: '#F97316', bg: '#FFF7ED' },
  
  // --- SPECIALIZED PROTECTION HELP ---
  { id: '5', title: 'Women Helpline', subtitle: 'महिला सुरक्षा हेल्पलाइन (National)', number: '1091', icon: 'woman', color: '#EC4899', bg: '#FDF2F8' },
  { id: '6', title: 'Women In Distress', subtitle: 'घरेलू हिंसा / प्रताड़ना सहायता', number: '181', icon: 'heart', color: '#DB2777', bg: '#FCE7F3' },
  { id: '7', title: 'Child Helpline', subtitle: 'बाल संरक्षण सहायता (Childline)', number: '1098', icon: 'people', color: '#0D9488', bg: '#CCFBF1' },
  { id: '8', title: 'Elder Line (Senior Citizens)', subtitle: 'वरिष्ठ नागरिकों के लिए राष्ट्रीय हेल्पलाइन', number: '14567', icon: 'ribbon', color: '#4F46E5', bg: '#EEF2FF' },

  // --- CRIME & UTILITIES ---
  { id: '9', title: 'Cyber Crime Helpline', subtitle: 'साइबर धोखाधड़ी / ऑनलाइन फ्रॉड शिकायत', number: '1930', icon: 'desktop', color: '#4F46E5', bg: '#EEF2FF' },
  { id: '10', title: 'Anti-Corruption Helpline', subtitle: 'भ्रष्टाचार विरोधी शिकायत सेल', number: '1064', icon: 'eye', color: '#059669', bg: '#D1FAE5' },
  { id: '11', title: 'LPG Gas Leakage', subtitle: 'गैस लीकेज / इमरजेंसी रिस्पॉन्स', number: '1906', icon: 'bonfire', color: '#7C3AED', bg: '#F3E8FF' },
  
  // --- ROAD & TRAFFIC EMERGENCY ---
  { id: '12', title: 'National Highway Accident', subtitle: 'NHAI रोड एक्सीडेंट हेल्पलाइन', number: '1033', icon: 'trending-up', color: '#059669', bg: '#D1FAE5' },
  { id: '13', title: 'Traffic Police Helpline', subtitle: 'यातायात समस्या / क्रेन सहायता', number: '1095', icon: 'car-sport', color: '#0284C7', bg: '#E0F2FE' },
  { id: '14', title: 'Railway Accident Information', subtitle: 'रेलवे आपातकालीन / दुर्घटना सहायता', number: '1072', icon: 'subway', color: '#D97706', bg: '#FEF3C7' },
  
  // --- DISASTER & MISC CUSTOMER CARE ---
  { id: '15', title: 'Disaster Management Services', subtitle: 'आपदा प्रबंधन राहत (NDRF)', number: '1070', icon: 'warning', color: '#475569', bg: '#F1F5F9' },
  { id: '16', title: 'Aadhaar Card Helpline', subtitle: 'UIDAI आधिकारिक कस्टमर केयर', number: '1947', icon: 'fingerprint', color: '#2563EB', bg: '#EFF6FF' },
];

export default function EmergencyPhonebook() {
  const router = useRouter();

  // 📞 Click-to-Dial Native Trigger Engine
  const handleDialPress = (number: string) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Call dialer open nahi ho raha hai.");
        }
      })
      .catch((err) => console.log(err));
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.contactCard}>
      {/* Icon Capsule Block */}
      <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>

      {/* Title Details Area */}
      <View style={styles.centerInfo}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
      </View>

      {/* Clickable Number Layout */}
      <TouchableOpacity 
        style={styles.dialerContainer} 
        onPress={() => handleDialPress(item.number)}
        activeOpacity={0.7}
      >
        <Text style={[styles.numberText, { color: item.color }]}>{item.number}</Text>
        <View style={[styles.callIconCircle, { backgroundColor: item.color }]}>
          <Ionicons name="call" size={13} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      {/* 🔮 Deep Crimson Red to Magenta Premium Gradient Header */}
      <LinearGradient
        colors={['#E11D48', '#991B1B', '#4C0519']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Phonebook</Text>
        </View>
        
        <View style={styles.headerAlertBox}>
          <Ionicons name="shield-checkmark" size={20} color="#FFF" style={{ marginTop: 1 }} />
          <Text style={styles.headerSubtitle}>
            आपातकाल में मदद, अब सिर्फ एक क्लिक दूर! किसी भी विपत्ति में तुरंत डायल करें।
          </Text>
        </View>
      </LinearGradient>

      {/* FlatList Database Render Matrix */}
      <FlatList
        data={EMERGENCY_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  premiumHeader: {
    paddingTop: Platform.OS === 'ios' ? 15 : 35,
    paddingBottom: 22,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerAlertBox: { flexDirection: 'row', gap: 8, marginTop: 12, backgroundColor: 'rgba(255, 255, 255, 0.16)', padding: 10, borderRadius: 12 },
  headerSubtitle: { flex: 1, fontSize: 12, color: '#FFFFFF', fontWeight: '600', lineHeight: 18 },
  listContainer: { paddingTop: 12, paddingBottom: 20 },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  centerInfo: { flex: 1, paddingHorizontal: 12 },
  titleText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  subtitleText: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' },
  dialerContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingLeft: 6 },
  numberText: { fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  callIconCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
});