import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 प्रीमियम ग्रेडिएंट्स के लिए इम्पोर्ट किया
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { partnerEarnings } from "../../api/api";

const { width } = Dimensions.get("window");

export default function Earnings() {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const user: any = JSON.parse(await AsyncStorage.getItem('user') || '{}');

      if (!user || !user.id) {
        setData([]);
        return;
      }

      const res = await partnerEarnings(user.id);
      const earningsList = res?.data?.data || [];
      setData(earningsList);

      let sum = 0;
      earningsList.forEach((item: any) => {
        if (item.type === 'credit') {
          sum += Number(item.amount);
        }
      });
      setTotal(sum);
    } catch (e) {
      console.log("Earnings Load Error: ", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderItem = ({ item }: any) => {
    if (!item) return null;
    const isCredit = item.type === 'credit';

    return (
      <View style={[styles.card, isCredit ? styles.cardCredit : styles.cardDebit]}>
        <View style={styles.cardRow}>

          {/* Status Indicator Dot/Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: isCredit ? '#E6F4EA' : '#FCE8E6' }]}>
            <Ionicons
              name={isCredit ? "arrow-down-circle" : "arrow-up-circle"} 
              size={20}
              color={isCredit ? '#137333' : '#C5221F'}
            />
          </View>

          <View style={styles.leftInfo}>
            <Text style={styles.remark} numberOfLines={1}>
              {item.remark || "Transaction Reference"}
            </Text>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={styles.date}>{item.created_at || 'Just now'}</Text>
            </View>
          </View>

          <View style={styles.rightAmount}>
            <Text style={[styles.amount, { color: isCredit ? '#10B981' : '#EF4444' }]}>
              {isCredit ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
            </Text>

            <View style={[
              styles.typeBadge,
              { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }
            ]}>
              <Text style={[
                styles.typeBadgeText,
                { color: isCredit ? '#15803D' : '#B91C1C' }
              ]}>
                {item.type || 'Processed'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 👑 प्रीमियम रॉयल थीम ग्रेडिएंट हेडर (नो वाइट स्पेस) */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.blueHeader}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard' as never);
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Earnings Ledger</Text>
        </View>

        {/* टोटल नेट अर्निंग कार्ड - ग्लासमोर्फिज़्म टच */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Net Earnings</Text>
            <Ionicons name="wallet-outline" size={18} color="#E9D5FF" />
          </View>
          <Text style={styles.balance}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
      </LinearGradient>

      <View style={styles.subStrip}>
        <Text style={styles.stripTitle}>TRANSACTION HISTORY</Text>
        <Text style={styles.stripCount}>{data.length} entries found</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6B38FB" />
          <Text style={styles.loadingText}>Loading statements safely...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={40} color="#6B38FB" />
              </View>
              <Text style={styles.emptyText}>No historical transactions</Text>
              <Text style={styles.emptySubText}>When you register verified assets or get paid, your timeline lists records instantly here.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' }, // 🌟 हल्का सा ग्रे-वॉइलेट बैकग्राउंड
  
  blueHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36),
    paddingBottom: 26,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#6B38FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  balanceLabel: { color: '#E9D5FF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  balance: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  
  subStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 8 },
  stripTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.8 },
  stripCount: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  listContent: { paddingTop: 4, paddingBottom: 30 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14, fontWeight: '500' },
  
  /* 🌟 रिडिजाइन्ड प्रीमियम लिस्टिंग कार्ड विद थीम बॉर्डर */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    shadowColor: "#6B38FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  cardCredit: { borderLeftColor: '#10B981' },
  cardDebit: { borderLeftColor: '#EF4444' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  leftInfo: { flex: 1, paddingRight: 8 },
  remark: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  rightAmount: { alignItems: 'flex-end', justifyContent: 'center' },
  amount: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  
  emptyWrap: { marginTop: 60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#E9D5FF' },
  emptyText: { color: '#1E293B', fontSize: 16, fontWeight: '700' },
  emptySubText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});