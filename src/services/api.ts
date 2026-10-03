import axios from 'axios';
import { getStorageItem } from './storage';
import { getUniqueDeviceId } from './device';

// Live Production URL (Commented Out)
// export const BASE_URL = "https://nearby.recallinfotech.com/api";
// export const IMAGE_BASE_URL = "https://nearby.recallinfotech.com/";

// Local Server URL (Active for Local Testing)
export const BASE_URL = "http://127.0.0.1:8000/api";
export const IMAGE_BASE_URL = "http://127.0.0.1:8000/";

export const APP_SECRET_KEY = "nearby_sec_2026_recall_app_key";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'X-App-Key': APP_SECRET_KEY,
  }
});

// Request interceptor to append Auth Bearer Token, App Key & Device ID
API.interceptors.request.use(async (config) => {
  try {
    if (config.headers) {
      config.headers['X-App-Key'] = APP_SECRET_KEY;
      const deviceId = await getUniqueDeviceId();
      if (deviceId) {
        config.headers['X-Device-Id'] = deviceId;
      }
    }
    const token = await getStorageItem('user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching auth token or device id:", err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Categories & Locations (With in-memory caching to avoid infinite duplicate requests)
let cachedCategoriesPromise: Promise<any> | null = null;
let cachedCategoriesTime = 0;
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCombinedCategories = (params?: { lat?: number | null; lng?: number | null }) => {
  const now = Date.now();
  if (cachedCategoriesPromise && now - cachedCategoriesTime < CATEGORIES_CACHE_TTL) {
    return cachedCategoriesPromise;
  }
  cachedCategoriesTime = now;
  cachedCategoriesPromise = API.get("/combined-categories", { params });
  return cachedCategoriesPromise;
};

export const clearCategoriesCache = () => {
  cachedCategoriesPromise = null;
  cachedCategoriesTime = 0;
};

export const getCategories = () => API.get("/categories");

export const getSubCategories = (category_id: number) =>
  API.get(`/sub-categories/${category_id}`);

export const getChildCategories = (sub_category_id: number) =>
  API.get(`/child-categories/${sub_category_id}`);

export const getStates = () => API.get("/states");

export const getCities = (state_id: number) => API.get(`/cities/${state_id}`);

export const getBanners = () => API.get("/banners");

// Providers & Listings
export const getProviders = (params?: {
  category_id?: number | null;
  sub_category_id?: number | null;
  child_category_id?: number | null;
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  min_radius?: number | null;
  search?: string;
  page?: number;
  user_id?: number | null;
}) => {
  return API.get("/providers", { params });
};

export const getProviderDetail = (id: number, user_id?: number) =>
  API.get(`/provider/${id}`, { params: { user_id } });

// Auth & Profile
export const loginUser = async (data: any) => {
  const deviceId = await getUniqueDeviceId();
  return API.post("/login", { ...data, device_id: data.device_id || deviceId });
};

export const logoutUser = async (userId?: any) => {
  const token = await getStorageItem('user_token');
  const user = await getStorageItem('user_info');
  const userIdVal = userId || user?.user_id || user?.id;

  return axios.post(
    "https://crm.hcinterior.in/login/mobile_logout",
    { user_id: String(userIdVal || "") },
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token || ""}`,
      },
    }
  );
};

export const registerUser = async (data: any) => {
  const deviceId = await getUniqueDeviceId();
  return API.post("/register", { ...data, device_id: data.device_id || deviceId });
};

export const googleLoginUser = async (data: any) => {
  const deviceId = await getUniqueDeviceId();
  return API.post("/google-login", { ...data, device_id: data.device_id || deviceId });
};

export const sendOtp = (data: any) => API.post("/send-otp", data);

export const verifyOtp = (data: any) => API.post("/verify-otp", data);

export const forgotPassword = (data: any) => API.post("/forgot-password", data);

export const resetPassword = (data: any) => API.post("/reset-password", data);

export const getProfile = (id: number) => API.get(`/profile/${id}`);

export const updateProfile = (data: FormData | any) => {
  if (data instanceof FormData) {
    return API.post(`/profile/update`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.post(`/profile/update`, data);
};

export const sendEmailOtp = (data: { user_id: number; email: string }) =>
  API.post('/profile/send-email-otp', data);

export const verifyEmailOtp = (data: { user_id: number; email: string; otp: string }) =>
  API.post('/profile/verify-email-otp', data);

// Wallet & Payments
export const getWallet = (user_id: number) => API.get(`/wallet/${user_id}`);

export const getTransactions = (user_id: number) => API.get(`/transactions/${user_id}`);

export const unlockProvider = (data: any) => API.post(`/unlock`, data);

export const addMoney = (data: any) => API.post("/add-money", data);

export const createOrder = (data: any) => API.post("/create-order", data);

export const verifyPayment = (data: any) => API.post("/verify-payment", data);

// Provider Business Management
export const registerProvider = (data: FormData | any) =>
  API.post(`/provider/register`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getUserBusinesses = (user_id: number) => API.get(`/user-businesses/${user_id}`);

export const updateProvider = (data: any) => API.post('/provider/update', data);

export const toggleProviderStatus = (id: number, user_id?: number) =>
  API.post(`/provider/toggle-status/${id}`, { user_id });

export const deleteProviderListing = (id: number, user_id?: number) =>
  API.post(`/provider/delete/${id}`, { user_id });

export const deleteProvider = (id: number) => API.delete(`/provider/${id}`);

export const uploadLogo = (form: FormData) =>
  API.post('/provider/upload-logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadBanner = (form: FormData) => API.post('/provider/upload-banner', form);

export const getDashboard = (id: number) => API.get(`/provider/dashboard/${id}`);

// Events & Classifieds
export const addEvent = (data: FormData | any) =>
  API.post("/add-event", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getNearbyEvents = (data: {
  latitude?: number;
  longitude?: number;
  category_id?: string | number | null;
  listing_type?: string | null;
  min_radius?: number | null;
  radius?: number | null;
  search?: string;
  user_id?: number | null;
}) => API.post("/nearby-events", data);

export const getEventDetails = (id: number, user_id?: number | null) =>
  API.get(`/event-details/${id}`, { params: { user_id } });

export const unlockEvent = (data: { user_id: number; event_id: number }) =>
  API.post("/unlock-event", data);

export const getMyEvents = (user_id: number) => API.post("/my-events", { user_id });

export const toggleEventStatus = (id: number, user_id?: number) =>
  API.post(`/event/toggle-status/${id}`, { user_id });

export const getEventUnlockLeads = (event_id: number, user_id: number) =>
  API.post(`/event-unlock-leads/${event_id}`, { user_id });

export const updateEvent = (event_id: number, data: FormData | any) =>
  API.post(`/update-event/${event_id}`, data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });

export const deleteEvent = (event_id: number, user_id: number) =>
  API.post(`/delete-event/${event_id}`, { user_id });

export const getEventCategories = (params?: { type?: string }) =>
  API.get("/event-categories", { params });

export const getEventPackages = (params?: { type?: string }) =>
  API.get("/event-packages", { params });

// Partner Portal
export const partnerAddBusiness = (data: FormData | any) =>
  API.post('/partner/add-business', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const partnerDashboard = (user_id: number) => API.get(`/partner/dashboard/${user_id}`);

export const partnerBusinesses = (
  user_id: number,
  params?: { search?: string; page?: number; per_page?: number }
) => API.get(`/partner/businesses/${user_id}`, { params });

export const partnerEarnings = (user_id: number) => API.get(`/partner/earnings/${user_id}`);

export const partnerWithdraw = (data: any) => API.post('/partner/withdraw', data);

export const applyPartner = (data: FormData | any) =>
  API.post('/partner/apply', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const partnerSettlementSummary = (user_id: number) =>
  API.get(`/partner/settlement-summary/${user_id}`);

export const partnerUpdateBusiness = (id: number, data: FormData | any) =>
  API.post(`/partner/update-business/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const checkPendingWithdraw = (user_id: number) =>
  API.get(`/partner/withdraw/check/${user_id}`);

// Business Claiming & Phonebook
export const searchBusinessByPhone = (phone: string, user_id?: number) =>
  API.post("/business/search-by-phone", { phone, user_id });

export const claimBusinessListing = (data: { user_id: number; provider_id: number; phone?: string; notes?: string; message?: string }) =>
  API.post("/business/claim", data);

export const getUserClaimRequests = (user_id: number) =>
  API.get(`/user/claim-requests/${user_id}`);

export const getUnlockedBusinesses = (user_id: number, params?: { search?: string; page?: number }) =>
  API.get(`/user/unlocked-businesses/${user_id}`, { params });

// 🗑️ Account Deletion & Restoration (30-Day Soft Delete & Retention)
export const deleteUserAccount = (data: { email: string; reason?: string }) =>
  API.post("/user/delete-account", data);

export const restoreUserAccount = (data: { email: string }) =>
  API.post("/user/restore-account", data);

export default API;
