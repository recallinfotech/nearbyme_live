import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserBusinesses } from '../../api/api';

export default function MyClaimedBusinesses() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnedListings();
  }, []);

  const fetchOwnedListings = async () => {
    try {
      const userObj = await AsyncStorage.getItem("user");
      const user = JSON.parse(userObj || "{}");

      if (user?.id) {
        const res = await getUserBusinesses(user.id);
        setBusinesses(res.data.data || []);
      }
    } catch (e) {
      console.log("Error loading claimed listings: ", e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const isApproved = item.status === 'approved';

    return (
      <View style={styles.businessCard}>
        <View style={styles.leftMetaBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="business" size={22} color="#2563EB" />
          </View>
        </View>

        <View style={styles.rightContentBox}>
          <Text style={styles.businessName} numberOfLines={1}>
            {item.business_name || "Unnamed Business"}
          </Text>
          <Text style={styles.addressLine} numberOfLines={1}>
            📍 {item.address || "No address detail available"}
          </Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isApproved ? '#E6F4EA' : '#FFF7ED' }]}>
              <Text style={[styles.statusBadgeText, { color: isApproved ? '#137333' : '#C2410C' }]}>
                {isApproved ? "Verified Owner" : "Pending Verification"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header Bar */}
      <View style={styles.blueHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Claimed Businesses</Text>
        </View>
        <Text style={styles.headerSubtitle}>List of businesses linked directly to your account ({businesses.length})</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your businesses...</Text>
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item, index) => item?.provider_id ? String(item.provider_id) : String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyText}>No Linked Businesses Yet</Text>
              <Text style={styles.emptySubText}>Aapne abhi tak koi business claim nahi kiya hai ya listings pending hain.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  blueHeader: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#93C5FD', marginTop: 4 },
  listContainer: { paddingTop: 16, paddingBottom: 35 },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 1,
  },
  leftMetaBox: { marginRight: 14 },
  iconCircle: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  rightContentBox: { flex: 1 },
  businessName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  addressLine: { fontSize: 12, color: '#64748B', marginTop: 3 },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#64748B', fontSize: 13 },
  emptyWrap: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptySubText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 4 }
});