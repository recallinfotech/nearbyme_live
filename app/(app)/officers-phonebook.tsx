import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

// 🏛️ Official Adhikari Contacts - Agra City
 // 🏛️ Agra City ke Sabhi Mukhya Adhikariyon Ki Full Verified Directory List
const OFFICERS_DATA = [
  // --- TOP ADMINISTRATION & POLICE ---
  { id: '1', title: 'DM (District Magistrate)', subtitle: 'जिलाधिकारी कार्यालय', number: '0562-2266060', icon: 'person', type: 'ion', color: '#059669', bg: '#D1FAE5' },
  { id: '2', title: 'CP (Commissioner of Police)', subtitle: 'पुलिस कमिश्नर कार्यालय', number: '0562-2421313', icon: 'shield-half', type: 'ion', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '3', title: 'SSP / SP City Office', subtitle: 'वरिष्ठ पुलिस अधीक्षक कार्यालय', number: '0562-2421204', icon: 'local-police', type: 'mat', color: '#1E40AF', bg: '#EFF6FF' },
  { id: '4', title: 'SDM (Sub-Divisional Magistrate)', subtitle: 'उप मंडल अधिकारी', number: '0562-2260550', icon: 'gavel', type: 'mat', color: '#7C3AED', bg: '#F3E8FF' },
  { id: '5', title: 'CO (Circle Officer - City)', subtitle: 'सर्कल ऑफिसर / पुलिस उपाधीक्षक', number: '0562-2261622', icon: 'account-box', type: 'mat', color: '#EA580C', bg: '#FFEDD5' },
  { id: '6', title: 'SHO POLICE (Main Kotwali)', subtitle: 'पुलिस स्टेशन कोतवाली प्रभारी', number: '0562-2421255', icon: 'security', type: 'mat', color: '#DC2626', bg: '#FEE2E2' },
  
  // --- MUNICIPAL, DEVELOPMENT & RTO ---
  { id: '7', title: 'MAYOR (Agra Municipal Corp.)', subtitle: 'महापौर / नगर निगम आगरा', number: '0562-2420804', icon: 'business', type: 'ion', color: '#D97706', bg: '#FEF3C7' },
  { id: '8', title: 'Municipal Commissioner (Nagar Aayukt)', subtitle: 'नगर आयुक्त कार्यालय', number: '0562-2421570', icon: 'location-city', type: 'mat', color: '#0D9488', bg: '#CCFBF1' },
  { id: '9', title: 'ADA Vice Chairman (Agra Dev. Authority)', subtitle: 'आगरा विकास प्राधिकरण उपाध्यक्ष', number: '0562-2511877', icon: 'account-balance', type: 'mat', color: '#4F46E5', bg: '#EEF2FF' },
  { id: '10', title: 'RTO (Regional Transport Office)', subtitle: 'क्षेत्रীয় परिवहन कार्यालय', number: '0562-2230198', icon: 'directions-car', type: 'mat', color: '#0284C7', bg: '#E0F2FE' },
  
  // --- PUBLIC UTILITIES, HEALTH & ESSENTIAL DEPARTMENTS ---
  { id: '11', title: 'CMO (Chief Medical Officer)', subtitle: 'मुख्य चिकित्सा अधिकारी (Agra Health)', number: '0562-2264696', icon: 'medical-services', type: 'mat', color: '#EF4444', bg: '#FEF2F2' },
  { id: '12', title: 'UPPCL Executive Engineer (Torrent/Electricity)', subtitle: 'विद्युत विभाग मुख्य अभियंता कार्यालय', number: '0562-2421307', icon: 'flash', type: 'ion', color: '#EAB308', bg: '#FEF9C3' },
  { id: '13', title: 'Jal Sansthan (Water Works Office)', subtitle: 'जल संस्थान मुख्य कार्यालय, आगरा', number: '0562-2521156', icon: 'water', type: 'ion', color: '#2563EB', bg: '#EFF6FF' },
  { id: '14', title: 'BSAC Office (Basic Shiksha Adhikari)', subtitle: 'जिला बेसिक शिक्षा अधिकारी कार्यालय', number: '0562-2157451', icon: 'school', type: 'mat', color: '#DB2777', bg: '#FCE7F3' },
  { id: '15', title: 'District Tourism Officer', subtitle: 'क्षेत्रीय पर्यटन कार्यालय, आगरा', number: '0562-2226431', icon: 'map', type: 'mat', color: '#059669', bg: '#D1FAE5' },
];
export default function OfficersPhonebook() {
  const router = useRouter();

  // 📞 Direct Call Handler
  const handleCallPress = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, ''); // Hyphen (-) hatane ke liye
    const url = `tel:${cleanNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Call dialer open karne me dikkat aa rahi hai.");
        }
      })
      .catch((err) => console.log(err));
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Icon Selector Panel */}
      <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
        {item.type === 'ion' ? (
          <Ionicons name={item.icon} size={20} color={item.color} />
        ) : (
          <MaterialIcons name={item.icon} size={20} color={item.color} />
        )}
      </View>

      {/* Center Details */}
      <View style={styles.centerInfo}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
        {/* 🔥 NUMBER DISPLAY ADDED HERE */}
        <Text style={styles.phoneText}>📞 {item.number}</Text>
      </View>

      {/* Call Action Area */}
      <TouchableOpacity 
        style={[styles.callBtn, { backgroundColor: item.color }]} 
        onPress={() => handleCallPress(item.number)}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={13} color="#FFFFFF" />
        <Text style={styles.callBtnText}>Call</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* 🏛️ Rich Blue-Navy Corporate Gradient Header */}
      <LinearGradient
        colors={['#1E3A8A', '#2563EB', '#1D4ED8']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agra City Adhikari Directory</Text>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="location" size={18} color="#FFF" />
          <Text style={styles.headerSubtitle}>
            शहर आगरा के सभी मुख्य अधिकारियों से जुड़ें एक ही ऐप में। विश्वसनीय और सत्यापित जानकारी।
          </Text>
        </View>
      </LinearGradient>

      {/* Main List Layout */}
      <FlatList
        data={OFFICERS_DATA}
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 15 : 35,
    paddingBottom: 22,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  infoBox: { flexDirection: 'row', gap: 8, marginTop: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 10, borderRadius: 12, alignItems: 'center' },
  headerSubtitle: { flex: 1, fontSize: 12, color: '#FFFFFF', fontWeight: '600', lineHeight: 18 },
  listContainer: { paddingTop: 14, paddingBottom: 20 },
  card: {
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
  centerInfo: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
  titleText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  subtitleText: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' },
  phoneText: { fontSize: 12, color: '#2563EB', fontWeight: '700', marginTop: 4 }, // Updated styles for phone text
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});