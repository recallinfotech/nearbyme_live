import { Ionicons } from "@expo/vector-icons"; // 🌟 प्रीमियम ऐरोज और आइकॉन के लिए
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient'; // 🌟 प्रीमियम ग्रेडिएंट्स के लिए
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getUnlockedBusinesses } from '../../api/api';

const { width } = Dimensions.get("window");

export default function MyPhonebook() {
  const navigation = useNavigation<any>(); 
  const router = useRouter(); 

  const [unlockedList, setUnlockedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const initUserSession = async () => {
    try {
      const userObj = await AsyncStorage.getItem("user");
      const user = JSON.parse(userObj || "{}");
      if (user?.id) {
        setUserId(user.id);
        fetchData(user.id, 1, '', true);
      } else {
        router.replace("/(auth)/login"); 
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchData = async (uId: number, pageNum: number, searchStr: string, shouldRefresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setMoreLoading(true);

      const res = await getUnlockedBusinesses(uId, { page: pageNum, search: searchStr });
      
      if (res && res.data && res.data.status) {
        const serverData = res.data.data.data || [];
        const lastPage = res.data.data.last_page || 1;

        if (shouldRefresh) {
          setUnlockedList(serverData);
        } else {
          setUnlockedList(prev => [...prev, ...serverData]);
        }

        setHasMore(pageNum < lastPage);
      }
    } catch (err) {
      console.log("Fetch Fail: ", err);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initUserSession();
      return () => {
        setUnlockedList([]);
      };
    }, [])
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setPage(1);
    if (userId) {
      fetchData(userId, 1, text, true);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || moreLoading || loading || !userId) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(userId, nextPage, search, false);
  };

  const handleCallPress = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => Alert.alert("Error", "Dialer load request fail."));
  };

  const handleWhatsAppPress = (phoneNumber: string, bizName: string) => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const formattedPhone = cleanNumber.startsWith('91') && cleanNumber.length > 10 ? cleanNumber : `91${cleanNumber}`;
    const defaultText = `Hello ${bizName}, saw your business profile card on Nearby app.`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultText)}`;

    Linking.canOpenURL(waUrl).then(supported => {
      if (supported) {
        Linking.openURL(waUrl);
      } else {
        Alert.alert("WhatsApp Issue", "Aapke device me WhatsApp setup complete nahi hai.");
      }
    });
  };

  const renderItem = ({ item }: any) => {
    // 🌟 फिक्स: पुरानी इमेज बदलकर एक बहुत ही सुंदर और क्लीन डिफ़ॉल्ट कॉन्टैक्ट/बुक आइकॉन सेट कर दिया है
    const defaultLogo = 'https://cdn-icons-png.flaticon.com/128/3771/3771518.png';
    
    return (
      <View style={styles.contactCard}>
        {/* कार्ड के लेफ्ट साइड की प्रीमियम थीम बार */}
        <View style={styles.cardThemeBar} />

        <Image source={{ uri: item.icon_url || defaultLogo }} style={styles.avatarThumb} />

        <View style={styles.centerInfo}>
          <Text style={styles.businessName} numberOfLines={1}>{item.business_name}</Text>
          <Text style={styles.categoryText}>📁 {item.category_name || 'Service Provider'}</Text>
          <Text style={styles.addressLine} numberOfLines={1}>📍 {item.address}</Text>
          <Text style={styles.phoneText}>📞 {item.phone}</Text>
        </View>

        <View style={styles.actionColumnContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.callColor]} 
            onPress={() => handleCallPress(item.phone)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={12} color="#FFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.waColor]} 
            onPress={() => handleWhatsAppPress(item.phone, item.business_name)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={12} color="#FFF" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* प्रीमियम रॉयल थीम ग्रेडिएंट हेडर */}
      <LinearGradient
        colors={["#B91C1C", "#6B38FB", "#5B21B6"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.blueHeader}
      >
        <View style={styles.topRow}>
          <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
            style={styles.menuBtn}
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Phonebook</Text>
        </View>

        {/* सर्च बार बॉक्स */}
        <View style={styles.searchBarBoxContainer}>
          <Ionicons name="search" size={18} color="#6B38FB" />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search by name or number..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6B38FB" />
          <Text style={styles.loadingText}>Syncing phonebook database entries...</Text>
        </View>
      ) : (
        <FlatList
          data={unlockedList}
          keyExtractor={(item) => String(item.provider_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => (
            moreLoading ? (
              <View style={styles.footerLoaderBox}>
                <ActivityIndicator size="small" color="#6B38FB" />
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyText}>No Matching Records Found</Text>
              <Text style={styles.emptySubText}>
                Is parameters query checklist block state me data content exist nahi karta.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' }, 
  blueHeader: { 
    paddingHorizontal: 18, 
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36), 
    paddingBottom: 18, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  menuBtn: { paddingRight: 4, paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  searchBarBoxContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', borderRadius: 12, height: 46, paddingHorizontal: 12, gap: 8 },
  searchTextInput: { flex: 1, fontSize: 14, color: '#0F172A', paddingVertical: 0, fontWeight: '600' },
  listContainer: { paddingTop: 14, paddingBottom: 20 },
  contactCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 14, 
    marginBottom: 10, 
    borderRadius: 16, 
    padding: 12, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#E9D5FF', 
    elevation: 3, 
    shadowColor: '#6B38FB', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4,
    overflow: 'hidden'
  },
  cardThemeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#6B38FB'
  },
  // 🌟 अवतार थंबनेल का डिफ़ॉल्ट बैकग्राउंड वाइट से बदलकर लाइट पर्पल थीम वाइब में कर दिया है
  avatarThumb: { width: 54, height: 54, borderRadius: 12, backgroundColor: '#F3E8FF', resizeMode: 'contain', marginLeft: 4 },
  centerInfo: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
  businessName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  categoryText: { fontSize: 11, color: '#6B38FB', marginTop: 2, fontWeight: '700' },
  addressLine: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' },
  phoneText: { fontSize: 12, color: '#5B21B6', fontWeight: '800', marginTop: 3 },
  actionColumnContainer: { gap: 8, justifyContent: 'center', alignItems: 'center' },
  actionButton: { width: 64, height: 32, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, elevation: 1 },
  callColor: { backgroundColor: '#10B981' },
  waColor: { backgroundColor: '#25D366' },
  actionButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: 13, fontWeight: '500' },
  footerLoaderBox: { paddingVertical: 14, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', marginTop: 120, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  emptySubText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4, lineHeight: 16 }
});