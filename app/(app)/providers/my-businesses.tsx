import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from "@react-navigation/native"; // ✅ DrawerActions और useNavigation इम्पोर्ट किया
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,

  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { partnerBusinesses } from "../../api/api";

export default function MyBusinesses() {
  const navigation = useNavigation<any>(); // ✅ नेविगेशन हुक इनिशियलाइज किया
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ⏱️ Debounce Search Input Logic (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Search badalne par hamesha page 1 se shuru hoga
  useEffect(() => {
    load(1, debouncedSearch);
  }, [debouncedSearch]);

  const load = async (pageNumber: number, searchQuery: string) => {
    try {
      setLoading(true);
      const user: any = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      if (!user || !user.id) {
        setData([]);
        return;
      }

      // API Call with current page and search phrase
      const res = await partnerBusinesses(user.id, {
        search: searchQuery,
        page: pageNumber,
        per_page: 10 // Ek page par 10 items dikhenge
      });

      if (res && res.data && res.data.status) {
        const paginateObj = res.data.data;
        
        setData(Array.isArray(paginateObj.data) ? paginateObj.data : []);
        setPage(paginateObj.current_page || 1);
        setLastPage(paginateObj.last_page || 1);
        setTotalRecords(paginateObj.total || 0);
      } else {
        setData([]);
      }
    } catch (e) {
      console.log("Load Error: ", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ➡️ Next Page Handler
  const handleNextPage = () => {
    if (page < lastPage) {
      load(page + 1, debouncedSearch);
    }
  };

  // ⬅️ Previous Page Handler
  const handlePrevPage = () => {
    if (page > 1) {
      load(page - 1, debouncedSearch);
    }
  };

  const handleEdit = (providerId: any) => {
    if (!providerId) return;
    router.push(`/partner/edit-business/${providerId}`);
  };

  const renderItem = ({ item }: any) => {
    if (!item) return null;

    const totalReward = Number(item.reward_amount || 0) + Number(item.bonus_amount || 0);
    const mainImage = item.icon_url || item.banner_image || item.proof_image;
    const isPlaceholder = !mainImage || mainImage.trim() === '';
    const mainImageUri = !isPlaceholder ? mainImage : 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png';

    const isApproved = item.partner_status === 'approved';
    const currentBizId = item.id || item.provider_id; 

    return (
      <View style={styles.compactRowCard}>
        <View style={[styles.leftImageContainer, isPlaceholder && styles.leftPlaceholderContainer]}>
          <Image source={{ uri: mainImageUri }} style={styles.compactImage} />
        </View>

        <View style={styles.rightInfoContainer}>
          <View style={styles.rowTopHeader}>
            <Text style={styles.bizName} numberOfLines={1}>
              {item.business_name || "Unnamed Business"}
            </Text>
            <Text style={styles.bizReward}>₹{totalReward}</Text>
          </View>

          <View style={styles.metaRow}>
            {item.category_name ? (
              <Text style={styles.categoryLightText} numberOfLines={1}>
                📁 {item.category_name}
              </Text>
            ) : null}

            <View style={[
              styles.miniStatusBadge,
              { backgroundColor: isApproved ? '#DCFCE7' : item.partner_status === 'rejected' ? '#FEE2E2' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.miniStatusText,
                { color: isApproved ? '#16A34A' : item.partner_status === 'rejected' ? '#DC2626' : '#D97706' }
              ]}>
                {item.partner_status || 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.lightDetailText} numberOfLines={1}>
              👤 {item.owner_name || 'N/A'}  •  📞 {item.phone || 'N/A'}
            </Text>
          </View>

          <Text style={styles.lightAddressText} numberOfLines={1}>
            📍 {item.address || 'No Address Provided'}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {isApproved ? (
            <View style={styles.lockedBox}>
              <Ionicons name="lock-closed" size={16} color="#94A3B8" />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => handleEdit(currentBizId)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={15} color="#2563EB" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 🎛️ Pagination Button Panel (Footer)
  const renderPaginationFooter = () => {
    if (lastPage <= 1) return null; 

    return (
      <View style={styles.paginationFooterContainer}>
        {/* Previous Button */}
        <TouchableOpacity 
          style={[styles.pageButton, page === 1 && styles.disabledPageButton]} 
          onPress={handlePrevPage}
          disabled={page === 1}
        >
          <Ionicons name="chevron-back" size={18} color={page === 1 ? "#94A3B8" : "#2563EB"} />
          <Text style={[styles.pageButtonText, page === 1 && styles.disabledButtonText]}>Prev</Text>
        </TouchableOpacity>

        {/* Page Status Indicator */}
        <View style={styles.pageInfoBox}>
          <Text style={styles.pageInfoText}>Page {page} of {lastPage}</Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.pageButton, page === lastPage && styles.disabledPageButton]} 
          onPress={handleNextPage}
          disabled={page === lastPage}
        >
          <Text style={[styles.pageButtonText, page === lastPage && styles.disabledButtonText]}>Next</Text>
          <Ionicons name="chevron-forward" size={18} color={page === lastPage ? "#94A3B8" : "#2563EB"} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* HEADER SECTION */}
      <View style={styles.blueHeader}>
        {/* 🛠️ न्यू टॉप रो: यहाँ हैमबर्गर मेन्यू ट्रिगर लगाया गया है */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuTrigger}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Businesses</Text>
        </View>
        
        <Text style={styles.subtitle}>Track your added verified businesses ({totalRecords})</Text>
        
        {/* 🔍 Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Fetching your list...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item?.id ? String(item.id) : (item?.provider_id ? String(item.provider_id) : String(index))}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderPaginationFooter}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No businesses found</Text>
              <Text style={styles.emptySubText}>Try adjusting your keywords or search phrases.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  blueHeader: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 24),
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  // 🎛️ टॉप रो स्टाइल फॉर सिंक विद कैटेगरीज
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  menuTrigger: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 3,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  compactRowCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  leftImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  leftPlaceholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rightInfoContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 4,
    justifyContent: 'center',
  },
  rowTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  bizName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  bizReward: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  categoryLightText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  miniStatusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  detailRow: {
    marginBottom: 2,
  },
  lightDetailText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  lightAddressText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  lockedBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 7,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  emptyText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 3,
  },
  paginationFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 10,
    paddingVertical: 4,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  disabledPageButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  pageInfoBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  }
});