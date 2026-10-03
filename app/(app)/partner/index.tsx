import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { partnerDashboard, partnerSettlementSummary } from "../../api/api";

const { width } = Dimensions.get("window");

export default function PartnerDashboard() {
  const navigation = useNavigation<any>();

  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [providerStatus, setProviderStatus] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>({
    wallet_balance: 0,
    total_settled: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      const userRaw = await AsyncStorage.getItem("user");

      if (!userRaw) {
        setProviderStatus(null);
        setData({});
        setLoading(false);
        return;
      }

      const user = JSON.parse(userRaw);

      const dashboardRes = await partnerDashboard(user.id);
      const dashboardData = dashboardRes.data?.data || {};
      setData(dashboardData);

      if (dashboardData.provider_status) {
        setProviderStatus(dashboardData.provider_status);
        user.provider_status = dashboardData.provider_status;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else if (user && user.provider_status) {
        setProviderStatus(user.provider_status);
      }

      try {
        const settlementRes = await partnerSettlementSummary(user.id);
        setSummary(settlementRes.data?.data || {});
      } catch (err) {
        console.log("Settlement fetch failed, using defaults");
      }

    } catch (e) {
      console.log("Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();

      return () => {
        setProviderStatus(null);
        setData({});
      };
    }, [])
  );

  const isNotApplied = !providerStatus || providerStatus === 'none';
  const isPending = providerStatus === 'pending';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* 👑 हेडर सेक्शन - अब लाइट वॉइलेट बैकग्राउंड के साथ */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuTrigger}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={28} color="#1E293B" />
          </TouchableOpacity>
          
          <View style={styles.headerTitles}>
            <Text style={styles.welcomeText}>WELCOME BACK 👋</Text>
            <Text style={styles.title}>Listing Partner</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationCircle} onPress={load} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color="#6B38FB" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6B38FB" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      ) : isNotApplied ? (
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>Access Restricted</Text>
          <Text style={styles.lockedDesc}>
            You need to register as an official Listing Partner and get approved before you can access dashboard features or view earnings.
          </Text>
          <TouchableOpacity
            style={[styles.applyNowBtn, { backgroundColor: '#6B38FB' }]}
            onPress={() => navigation.navigate('apply')}
          >
            <Text style={styles.applyNowText}>Apply Now to Activate 🚀</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {isPending && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>
                ⏳ Application Status: <Text style={{fontWeight: '900'}}>PENDING</Text>{"\n"}Verification is underway. Dashboard actions will unlock automatically once approved.
              </Text>
            </View>
          )}

          {/* 💰 प्रीमियम अर्निंग कार्ड */}
          <LinearGradient
            colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.2 }}
            style={[styles.mainCard, isPending && styles.disabledCard]}
          >
            <View style={styles.mainCardLeft}>
              <Text style={styles.label}>TOTAL EARNINGS</Text>
              <Text style={styles.value}>₹{Number(data.balance || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.cardSubText}>Keep going! Your growth starts here.</Text>
            </View>
            <View style={styles.walletGraphicContainer}>
              <Ionicons name="wallet-outline" size={30} color="#FFF" />
            </View>
          </LinearGradient>

          {/* 📊 प्रीमियम काउंटर्स ग्रिड */}
          <View style={styles.statsRow}>
            {/* 1. Settled Amount */}
            <View style={[styles.smallCard, styles.settledCard, isPending && styles.disabledCard]}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <View style={[styles.smallCardIconBg, { backgroundColor: '#E6F4EA' }]}>
                <Ionicons name="cash-outline" size={14} color="#10B981" />
              </View>
              <Text style={styles.smallValue} numberOfLines={1}>
                ₹{Number(summary.total_settled || 0).toLocaleString('en-IN')}
              </Text>
              <View style={styles.smallCardBottomRow}>
                <Text style={styles.smallLabel}>Settled Amt</Text>
                <Ionicons name="chevron-forward" size={10} color="#10B981" />
              </View>
            </View>

            {/* 2. Total Listings */}
            <View style={[styles.smallCard, styles.totalListCard, isPending && styles.disabledCard]}>
              <View style={[styles.statusDot, { backgroundColor: '#6B38FB' }]} />
              <View style={[styles.smallCardIconBg, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="list-outline" size={14} color="#6B38FB" />
              </View>
              <Text style={styles.smallValue}>{data.total || 0}</Text>
              <View style={styles.smallCardBottomRow}>
                <Text style={styles.smallLabel}>Total List</Text>
                <Ionicons name="chevron-forward" size={10} color="#6B38FB" />
              </View>
            </View>

            {/* 3. Approved Listings */}
            <View style={[styles.smallCard, styles.approvedCard, isPending && styles.disabledCard]}>
              <View style={[styles.statusDot, { backgroundColor: '#A855F7' }]} />
              <View style={[styles.smallCardIconBg, { backgroundColor: '#FDF4FF' }]}>
                <Ionicons name="checkmark-done-circle-outline" size={14} color="#A855F7" />
              </View>
              <Text style={styles.smallValue}>{data.approved || 0}</Text>
              <View style={styles.smallCardBottomRow}>
                <Text style={styles.smallLabel}>Approved</Text>
                <Ionicons name="chevron-forward" size={10} color="#A855F7" />
              </View>
            </View>
          </View>

          {/* ⚡ क्विक एक्शन्स सेक्शन */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          </View>

          {/* पहली रो - अब वर्टिकल आइकॉन और टेक्स्ट के साथ (नो हाइडिंग इशू) */}
          <View style={styles.actionGridRow}>
            <TouchableOpacity
              style={[styles.actionListItem, isPending && styles.disabledGridBtn]}
              disabled={isPending}
              onPress={() => navigation.navigate('add-business')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="add" size={22} color="#6B38FB" />
              </View>
              <Text style={styles.actionMainTitle}>Add Business</Text>
              <Text style={styles.actionSubTitle}>List a new firm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionListItem, isPending && styles.disabledGridBtn]}
              disabled={isPending}
              onPress={() => navigation.navigate('my-businesses')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="business" size={18} color="#10B981" />
              </View>
              <Text style={styles.actionMainTitle}>My Businesses</Text>
              <Text style={styles.actionSubTitle}>Manage listed firms</Text>
            </TouchableOpacity>
          </View>

          {/* दूसरी रो */}
          <View style={styles.actionGridRow}>
            <TouchableOpacity
              style={[styles.actionListItem, isPending && styles.disabledGridBtn]}
              disabled={isPending}
              onPress={() => navigation.navigate('earnings')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="trending-up" size={18} color="#D97706" />
              </View>
              <Text style={styles.actionMainTitle}>Earnings History</Text>
              <Text style={styles.actionSubTitle}>Track your payouts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionListItem, isPending && styles.disabledGridBtn]}
              disabled={isPending}
              onPress={() => navigation.navigate('withdraw')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="wallet" size={18} color="#DB2777" />
              </View>
              <Text style={styles.actionMainTitle}>Withdraw</Text>
              <Text style={styles.actionSubTitle}>Request a payout</Text>
            </TouchableOpacity>
          </View>

          {/* 🏆 बॉटम प्रमोशनल ट्रॉफी बैनर */}
          <LinearGradient
            colors={["#6B38FB", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoLeft}>
              <Text style={styles.promoEmoji}>🏆</Text>
              <View style={styles.promoTexts}>
                <Text style={styles.promoTitle}>Keep Listing, Keep Earning!</Text>
                <Text style={styles.promoDesc}>More listings, more earnings. Let's grow together!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.9}>
              <Text style={styles.promoBtnText}>Explore</Text>
              <Ionicons name="chevron-forward" size={10} color="#6B38FB" />
            </TouchableOpacity>
          </LinearGradient>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 🌟 पूरे पेज का बैकग्राउंड अब वाइट से हल्का सा वॉइलेट-ग्रे शेड कर दिया है
  container: { flex: 1, backgroundColor: '#F5F3FF' }, 
  
  // 🌟 हेडर का बैकग्राउंड अब लाइट वॉइलेट शेड में सेट किया है (नो प्योर वाइट)
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === "ios" ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
    paddingBottom: 16,
    backgroundColor: '#EDE9FE',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center' },
  menuTrigger: { paddingRight: 14 },
  headerTitles: { justifyContent: 'center' },
  welcomeText: { fontSize: 11, color: '#7C3AED', fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 1 },
  
  notificationCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 1 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: 13, fontWeight: '600' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  
  mainCard: { borderRadius: 20, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#6B38FB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
  mainCardLeft: { flex: 1 },
  label: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  value: { color: '#fff', fontSize: 38, fontWeight: '800', marginTop: 2 },
  cardSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8, fontWeight: '500' },
  walletGraphicContainer: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 60, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  smallCard: { width: '31.5%', borderRadius: 16, padding: 12, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FFF', position: 'relative', elevation: 3, shadowColor: "#6B38FB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  settledCard: { backgroundColor: '#F0FDF4', borderColor: '#D1FAE5' }, 
  totalListCard: { backgroundColor: '#EFF6FF', borderColor: '#E0E7FF' }, 
  approvedCard: { backgroundColor: '#FDF4FF', borderColor: '#F3E8FF' }, 
  statusDot: { position: 'absolute', top: 12, right: 12, width: 5, height: 5, borderRadius: 2.5 },
  smallCardIconBg: { width: 26, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  smallValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  smallCardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  smallLabel: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  
  sectionTitleRow: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  actionGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  
  // 🌟 क्विक एक्शन कार्ड स्टाइल: अब वर्टिकल लुक में बेहतरीन पैडिंग के साथ सेट है
  actionListItem: { 
    width: '48.5%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingVertical: 16, 
    paddingHorizontal: 12, 
    alignItems: 'center', // सेंटर अलाइनमेंट आइकॉन और टेक्स्ट को ऊपर-नीचे रखने के लिए
    justifyContent: 'center',
    borderWidth: 1.5, 
    borderColor: '#E9D5FF', 
    elevation: 3, 
    shadowColor: '#6B38FB', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 4 
  },
  actionIconWrapper: { width: 40, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionMainTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  actionSubTitle: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  promoBanner: { borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, overflow: 'hidden' },
  promoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  promoEmoji: { fontSize: 32, marginRight: 10 },
  promoTexts: { flex: 1 },
  promoTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  promoDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '500', marginTop: 2 },
  promoBtn: { backgroundColor: '#fff', paddingHorizontal: 10, height: 30, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  promoBtnText: { color: '#6B38FB', fontSize: 11, fontWeight: '700' },

  lockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 50 },
  lockedIcon: { fontSize: 64, marginBottom: 16 },
  lockedTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  lockedDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  applyNowBtn: { paddingHorizontal: 30, paddingVertical: 16, borderRadius: 18, width: '100%', alignItems: 'center' },
  applyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  pendingBanner: { backgroundColor: '#FFEDD5', padding: 14, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FDBA74' },
  pendingText: { color: '#9A3412', fontSize: 12, fontWeight: '600', lineHeight: 18 },
  disabledCard: { opacity: 0.6 },
  disabledGridBtn: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', opacity: 0.6 },
});