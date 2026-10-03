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
import { getMyEvents } from '../../api/api';

export default function MyEventsList() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const userObj = await AsyncStorage.getItem("user");
      const user = JSON.parse(userObj || "{}");

      if (user?.id) {
        const res = await getMyEvents(user.id);
        setEvents(res.data.data || []);
      }
    } catch (e) {
      console.log("Error loading events listing: ", e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const isApproved = item.status === 'approved';

    return (
      <View style={styles.eventCard}>
        <View style={styles.leftMetaBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={22} color="#9333EA" />
          </View>
        </View>

        <View style={styles.rightContentBox}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title || "Unnamed Event"}
          </Text>
          <Text style={styles.dateLine}>
            📅 {item.event_date || "Date N/A"}
          </Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isApproved ? '#E6F4EA' : '#FFF7ED' }]}>
              <Text style={[styles.statusBadgeText, { color: isApproved ? '#137333' : '#C2410C' }]}>
                {isApproved ? "Live & Approved" : "Pending Verification"}
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
      <View style={styles.purpleHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Hosted Events</Text>
        </View>
        <Text style={styles.headerSubtitle}>Manage and track your published ecosystem events ({events.length})</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>No Events Scheduled</Text>
              <Text style={styles.emptySubText}>Aapne abhi tak koi event host nahi kiya hai. Naya event banayein!</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  purpleHeader: {
    backgroundColor: '#7C3AED', // Sleek violet tone for events focus
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#DDD6FE', marginTop: 4 },
  listContainer: { paddingTop: 16, paddingBottom: 35 },
  eventCard: {
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
  iconCircle: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  rightContentBox: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  dateLine: { fontSize: 12, color: '#64748B', marginTop: 3 },
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