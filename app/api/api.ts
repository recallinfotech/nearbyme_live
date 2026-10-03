import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Live Production URL
export const BASE_URL = "https://nearby.recallinfotech.com/api";

// Local Server URL (Commented Out)
// export const BASE_URL = "http://192.168.29.218:8000/api";

export const APP_SECRET_KEY = "nearby_sec_2026_recall_app_key";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Accept": "application/json",
    "X-App-Key": APP_SECRET_KEY,
  },
});

// Request interceptor to append Auth Bearer Token & App Key
API.interceptors.request.use(
  async (config) => {
    try {
      if (config.headers) {
        config.headers["X-App-Key"] = APP_SECRET_KEY;
      }
      const token =
        (await AsyncStorage.getItem("user_token")) ||
        (await AsyncStorage.getItem("token"));
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error attaching auth token in app/api:", err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const logoutUser = async (userId?: any) => {
  const token =
    (await AsyncStorage.getItem("user_token")) ||
    (await AsyncStorage.getItem("token"));
  const userStr = await AsyncStorage.getItem("user");
  let userIdVal = userId;
  if (!userIdVal && userStr) {
    try {
      const u = JSON.parse(userStr);
      userIdVal = u?.user_id || u?.id;
    } catch (e) {}
  }

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

export const getCombinedCategories = (params?: { lat?: number | null; lng?: number | null }) => {
  return API.get("/combined-categories", { params });
};

export const getCategories = () => API.get("/categories");
//export const getProviders = () => API.get("/providers");
export const getSubCategories = (category_id: number) =>
  API.get(`/sub-categories/${category_id}`);
export const getChildCategories = (sub_category_id: number) =>
  API.get(`/child-categories/${sub_category_id}`);

export const getStates = () =>
  API.get("/states");

export const getCities = (state_id: number) =>
  API.get(`/cities/${state_id}`);


export const getProviders = (params?: {
  category_id?: number | null;
  sub_category_id?: number | null;
  lat?: number;
  lng?: number;
  search?: string;
  page?: number;
}) => {
  return API.get("/providers", {
    params,
  });
};
export const getProviderDetail = (id: number, user_id?: number) =>
  API.get(`/provider/${id}`, {
    params: { user_id },
  });

 
  
 
 

export const loginUser = (data: any) =>
  API.post("/login", data);

export const registerUser = (data: any) =>
  API.post("/register", data);

export const googleLoginUser = (data: any) => API.post("/google-login", data);

export const sendOtp = (data: any) =>
  API.post("/send-otp", data);

export const verifyOtp = (data: any) =>
  API.post("/verify-otp", data);

export const forgotPassword = (
  data: any
) =>
  API.post(
    "/forgot-password",
    data
  );

  export const resetPassword = (
  data: any
) =>
  API.post(
    "/reset-password",
    data
  );


export const getWallet = (user_id: number) =>
  API.get(`/wallet/${user_id}`);

export const getTransactions = (user_id: number) =>
  API.get(`/transactions/${user_id}`);

export const unlockProvider = (data: any) =>
  API.post(`/unlock`, data);
// export const addMoney = (data: any) =>
//   API.post("/add-money", data);



export const getProfile = (id: number) =>
  API.get(`/profile/${id}`);

export const updateProfile = (data: any) =>
  API.post(`/profile/update`, data);

export const registerProvider = (data: any) =>
  API.post(
    `/provider/register`,
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

 export const getUserBusinesses = (user_id: number) =>
  API.get(`/user-businesses/${user_id}`);

 

export const updateProvider = (data:any) =>
  API.post('/provider/update', data);

export const deleteProvider = (id:number) =>
  API.delete(`/provider/${id}`);

export const uploadLogo = (form:any) =>
  API.post('/provider/upload-logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadBanner = (form:any) =>
  API.post('/provider/upload-banner', form);

export const getDashboard = (id:number) =>
  API.get(`/provider/dashboard/${id}`);


export const addEvent = (data: any) =>

  API.post(
    "/add-event",
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

export const getNearbyEvents = (data: {
  latitude: number;
  longitude: number;
  category_id?: string;
  radius?: number;
  search?: string;
}) =>
  API.post("/nearby-events", data);

export const getEventDetails = (id: number) =>
  API.get(`/event-details/${id}`);

export const getMyEvents = (user_id: number) =>
  API.post("/my-events", {
    user_id,
  });

export const getEventCategories = () =>
  API.get("/event-categories");

 
export const getEventPackages =
() =>
API.get("/event-packages");

export const addMoney = (data: any) =>
  API.post("/add-money", data);

export const createOrder = (data: any) =>
  API.post("/create-order", data);

export const verifyPayment = (data: any) =>
  API.post("/verify-payment", data);

 

export const partnerAddBusiness = (
  data:any
) =>
  API.post(
    '/partner/add-business',
    data,
    {
      headers:{
        'Content-Type':
          'multipart/form-data'
      }
    }
  );

export const partnerDashboard = (
  user_id:number
) =>
  API.get(
    `/partner/dashboard/${user_id}`
  );

// export const partnerBusinesses = (
//   user_id:number
// ) =>
//   API.get(
//     `/partner/businesses/${user_id}`
//   );


export const partnerBusinesses = (
    user_id: number, 
    params?: { search?: string; page?: number; per_page?: number }
) => {
    return API.get(`/partner/businesses/${user_id}`, {
        params,
    });
};

export const partnerEarnings = (
  user_id:number
) =>
  API.get(
    `/partner/earnings/${user_id}`
  );

export const partnerWithdraw = (
  data:any
) =>
  API.post(
    '/partner/withdraw',
    data
  );



export const applyPartner = (data: any) =>
  API.post(
    '/partner/apply',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data', // 👈 यह हेडर होना बहुत ज़रूरी है
      },
    }
  );
  

  export const partnerSettlementSummary = (
  user_id: number
) =>
  API.get(
    `/partner/settlement-summary/${user_id}`
  );


export const partnerUpdateBusiness = (id: number, data: any) =>
  API.post(`/partner/update-business/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  export const checkPendingWithdraw = (user_id: number) =>
  API.get(`/partner/withdraw/check/${user_id}`);

  export const getBanners = () => API.get("/banners");

  export const searchBusinessByPhone = (phone: string) => {
  return API.post("/business/search-by-phone", { phone });
};

export const claimBusinessListing = (data: { user_id: number; provider_id: number; phone: string; otp: string }) => {
  return API.post("/business/claim", data);
};

export const getUnlockedBusinesses = (user_id: number, params?: { search?: string; page?: number }) => {
  return API.get(`/user/unlocked-businesses/${user_id}`, { params });
};

export const toggleProviderStatus = (id: number, user_id?: number) =>
  API.post(`/provider/toggle-status/${id}`, { user_id });

export const deleteProviderListing = (id: number, user_id?: number) =>
  API.post(`/provider/delete/${id}`, { user_id });

export const toggleEventStatus = (id: number, user_id?: number) =>
  API.post(`/event/toggle-status/${id}`, { user_id });

export const deleteEvent = (event_id: number, user_id?: number) =>
  API.post(`/delete-event/${event_id}`, { user_id });

// 🗑️ Account Deletion & Restoration
export const deleteUserAccount = (data: { email: string; reason?: string }) => {
  return API.post("/user/delete-account", data);
};

export const restoreUserAccount = (data: { email: string }) => {
  return API.post("/user/restore-account", data);
};

export default API;
