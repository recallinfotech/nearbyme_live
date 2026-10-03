import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getCategories,
  getSubCategories,
  getStates,
  getCities,
  partnerAddBusiness,
} from '../services/api';
import { getCurrentUserLocation } from '../services/location';
import { CameraCaptureButton } from '../components/common/CameraCaptureButton';
import { CameraPhotoResult } from '../services/camera';
import {
  Briefcase,
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  Grid,
  Layers,
  Clock,
  Camera,
  CheckCircle2,
  X,
  Navigation,
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';

export const AddBusinessPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Tags State
  const [currentTag, setCurrentTag] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);

  // Modals Visibility & Search States
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  const [form, setForm] = useState({
    business_name: '',
    address: '',
    city: '',          // Database City ID
    city_name: '',     // UI display
    state: '',         // Database State ID
    state_name: '',    // UI display
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    category_id: '',
    category_name: '',
    sub_category_id: '',
    sub_category_name: '',
    working_from: '',
    working_to: '',
    is_24x7_available: 0, // 0 = No, 1 = Yes
    owner_name: '',
    proof_image: null as CameraPhotoResult | null,
    icon_url: null as CameraPhotoResult | null,
    banner_image: null as CameraPhotoResult | null,

    // Reverse Geocoding Parameters for Deep API Integration
    display_name: '',
    road: '',
    suburb: '',
    village: '',
    county: '',
    state_district: '',
    postcode: '',
    country: '',
    country_code: ''
  });

  useEffect(() => {
    loadCategories();
    loadStates();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data || []);
    } catch (e) {
      console.error("Error loading categories:", e);
    }
  };

  const loadSubCategories = async (catId: number | string) => {
    try {
      const res = await getSubCategories(Number(catId));
      setSubCategories(res.data?.data || []);
    } catch (e) {
      console.error("Error loading subcategories:", e);
    }
  };

  const loadStates = async () => {
    try {
      const res = await getStates();
      setStates(res.data?.data || []);
    } catch (e) {
      console.error("Error loading states:", e);
    }
  };

  const loadCities = async (stateId: number | string) => {
    try {
      const res = await getCities(Number(stateId));
      const cityList = res.data?.data || [];
      setCities(cityList);
      return cityList;
    } catch (e) {
      console.error("Error loading cities:", e);
      return [];
    }
  };

  // Tags Handlers
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.endsWith(',')) {
      const cleanTag = text.replace(',', '').trim();
      if (cleanTag && !tagsArray.includes(cleanTag)) {
        setTagsArray([...tagsArray, cleanTag]);
      }
      setCurrentTag('');
    } else {
      setCurrentTag(text);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanTag = currentTag.trim();
      if (cleanTag && !tagsArray.includes(cleanTag)) {
        setTagsArray([...tagsArray, cleanTag]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTagsArray(tagsArray.filter((_, index) => index !== indexToRemove));
  };

  // Geolocation & Reverse Geocoding Sync
  const handleFetchLocation = async () => {
    setGeoLoading(true);
    setFormMsg(null);
    try {
      const location = await getCurrentUserLocation();
      if (!location) {
        alert("GPS Location access denied or disabled. Please enable location services.");
        setGeoLoading(false);
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&addressdetails=1`,
        { headers: { 'User-Agent': 'NearbyAppPartnerSystem' } }
      );
      const json = await response.json();

      let detectedCityName = "";
      let detectedStateName = "";
      let matchedStateId = "";
      let matchedCityId = "";

      if (json && json.address) {
        detectedCityName = json.address.city || json.address.district || json.address.town || json.address.state_district || "";
        detectedStateName = json.address.state || "";

        const stateMatch = states.find(
          (s) => s.name && s.name.toLowerCase().replace(/\s+/g, '') === detectedStateName.toLowerCase().replace(/\s+/g, '')
        );

        if (stateMatch) {
          matchedStateId = String(stateMatch.id);
          const cityList = await loadCities(stateMatch.id);
          const cityMatch = cityList.find(
            (c: any) => c.name && c.name.toLowerCase().replace(/\s+/g, '') === detectedCityName.toLowerCase().replace(/\s+/g, '')
          );
          if (cityMatch) {
            matchedCityId = String(cityMatch.id);
          }
        }
      }

      setForm((prev) => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        state: matchedStateId || prev.state,
        state_name: detectedStateName || "Uttar Pradesh",
        city: matchedCityId || prev.city,
        city_name: detectedCityName || "Agra",

        display_name: json.display_name || "",
        address: prev.address || json.display_name || "",
        road: json.address?.road || "",
        suburb: json.address?.suburb || "",
        village: json.address?.village || "",
        county: json.address?.county || "",
        state_district: json.address?.state_district || "",
        postcode: json.address?.postcode || "",
        country: json.address?.country || "",
        country_code: json.address?.country_code || ""
      }));

      alert(`Location Locked Successfully ✅\n📍 ${detectedCityName || 'Agra'}, ${detectedStateName || 'Uttar Pradesh'}`);
    } catch (e: any) {
      console.error("GPS Fetch Error:", e);
      alert("GPS captured, but region auto-matching failed.");
    } finally {
      setGeoLoading(false);
    }
  };

  // Submit Business Profile Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.business_name || !form.business_name.trim()) {
      alert("Please enter the Business Name.");
      return;
    }

    if (!form.icon_url || !form.icon_url.blob) {
      alert("Logo Required: Please capture the shop/service photo using the live camera before submitting.");
      return;
    }

    if (!form.latitude || !form.longitude) {
      alert("Location Required: Please click on 'Fetch Location' to capture coordinates.");
      return;
    }

    if (!user || !user.id) {
      alert("User session not found. Please log in again.");
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    setFormMsg(null);

    try {
      const formData = new FormData();
      formData.append("user_id", String(user.id));
      formData.append("business_name", String(form.business_name).trim());
      formData.append("latitude", String(form.latitude));
      formData.append("longitude", String(form.longitude));
      formData.append("is_24x7_available", String(form.is_24x7_available));

      // 1. Mandatory Logo / Shop Photo (Camera capture blob)
      if (form.icon_url.blob) {
        formData.append("icon_url", form.icon_url.blob, "logo_camera.jpg");
      }

      if (form.address && form.address.trim()) {
        formData.append("address", String(form.address).trim());
      }
      if (form.phone && form.phone.trim()) {
        formData.append("phone", String(form.phone).trim());
      }
      if (form.email && form.email.trim()) {
        formData.append("email", String(form.email).trim());
      }
      if (form.owner_name && form.owner_name.trim()) {
        formData.append("owner_name", String(form.owner_name).trim());
      }
      if (tagsArray.length > 0) {
        formData.append("tags", tagsArray.join(','));
      }
      if (form.category_id) {
        formData.append("category_id", String(form.category_id));
      }
      if (form.sub_category_id) {
        formData.append("sub_category_id", String(form.sub_category_id));
      }

      formData.append("state", form.state ? String(form.state) : "");
      formData.append("city", form.city ? String(form.city) : "");
      formData.append("working_from", form.is_24x7_available === 1 ? "00:00" : String(form.working_from || ""));
      formData.append("working_to", form.is_24x7_available === 1 ? "23:59" : String(form.working_to || ""));

      formData.append("display_name", String(form.display_name || ""));
      formData.append("road", String(form.road || ""));
      formData.append("suburb", String(form.suburb || ""));
      formData.append("village", String(form.village || ""));
      formData.append("county", String(form.county || ""));
      formData.append("state_district", String(form.state_district || ""));
      formData.append("postcode", String(form.postcode || ""));
      formData.append("country", String(form.country || ""));
      formData.append("country_code", String(form.country_code || ""));

      // 2. Optional Frontage Banner (Camera capture blob)
      if (form.banner_image && form.banner_image.blob) {
        formData.append("banner_image", form.banner_image.blob, "banner_camera.jpg");
      }

      // 3. Optional Proof Document (Camera capture blob)
      if (form.proof_image && form.proof_image.blob) {
        formData.append("proof_image", form.proof_image.blob, "proof_camera.jpg");
      }

      const res = await partnerAddBusiness(formData);

      if (res.data?.status || res.data?.success) {
        alert(res.data.message || "Business onboarding profile submitted successfully!");
        navigate('/partner');
      } else {
        setFormMsg(res.data?.message || "Failed to submit business profile.");
      }
    } catch (err: any) {
      console.error("Partner add business error:", err);
      setFormMsg(err.response?.data?.message || "Something went wrong while submitting business.");
    } finally {
      setLoading(false);
    }
  };

  const isApprovedPartner =
    user?.provider_status === 'approved' ||
    Number(user?.is_partner) === 1 ||
    user?.is_partner === true ||
    Number(user?.is_provider) === 1 ||
    user?.is_provider === true;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Royal Theme Gradient Header Banner */}
        <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-4 sm:p-5 rounded-2xl text-white shadow-md space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-white" />
                <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                  {isApprovedPartner ? 'Add Business' : 'List Your Business / Service'}
                </h1>
              </div>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
              {isApprovedPartner ? '🤝 Partner • Unlimited' : '🏬 Free User (Max 2)'}
            </span>
          </div>
          <p className="text-xs text-indigo-100 font-normal pl-8">
            {isApprovedPartner
              ? 'Earn commissions by onboarding verified shops & service businesses around your locality.'
              : 'Register your shop, clinic, or service firm for free (up to 2 listings per account/phone).'}
          </p>
        </div>

        {/* Main Onboarding Form Card */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          {formMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {formMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. GENERAL INFORMATION */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>General Information</span>
              </div>

              {/* Business Name * */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reliance Smart / Agrawal Prints"
                    value={form.business_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Owner Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Full Name of Enterprise Owner"
                    value={form.owner_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="10-digit primary number"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="name@business.com"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Shop No, Street, Landmark details..."
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Specialities / Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Tags / Specialities (Min 2 Tags)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. offset printing, flex banner (Press Enter or Comma)"
                    value={currentTag}
                    onChange={handleTagInput}
                    onKeyDown={handleTagKeyDown}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {tagsArray.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {tagsArray.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(idx)}
                          className="hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. CATEGORIZATION */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-0.5">
                <Grid className="w-3.5 h-3.5" />
                <span>Categorization</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Select Modal Button */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalVisible(true)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center justify-between hover:border-indigo-500 transition"
                  >
                    <span className={form.category_name ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                      {form.category_name || "Select Category"}
                    </span>
                    <Grid className="w-4 h-4 text-indigo-500 shrink-0" />
                  </button>
                </div>

                {/* SubCategory / Service Type Select Modal Button */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Type
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.category_id) {
                        alert("Please select a category first.");
                        return;
                      }
                      setSubCategoryModalVisible(true);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center justify-between hover:border-indigo-500 transition"
                  >
                    <span className={form.sub_category_name ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                      {form.sub_category_name || "Select Service Type"}
                    </span>
                    <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. WORKING HOURS */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Working Hours</span>
              </div>

              {/* 24x7 Available Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Open 24x7 Available
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_24x7_available === 1}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_24x7_available: e.target.checked ? 1 : 0 }))}
                  className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Opening & Closing Times (when 24x7 is OFF) */}
              {form.is_24x7_available === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={form.working_from}
                      onChange={(e) => setForm((prev) => ({ ...prev, working_from: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={form.working_to}
                      onChange={(e) => setForm((prev) => ({ ...prev, working_to: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. BUSINESS PHOTOS & VERIFICATION */}
            <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-0.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Business Photos & Verification</span>
              </div>

              {/* Photo 1: Business Logo / Shop Photo (Mandatory * -> Strict Live Camera Only) */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-800 dark:text-slate-200">
                    Photo 1: Business Logo / Main Shop Photo <span className="text-rose-500 font-normal">* (Camera Only)</span>
                  </label>
                  {form.icon_url?.webPath && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> Captured
                    </span>
                  )}
                </div>

                {form.icon_url?.webPath ? (
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-2xs">
                      <img src={form.icon_url.webPath} alt="Captured Logo" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Live Camera Photo
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, icon_url: null }))}
                        className="absolute top-2 right-2 px-2 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold shadow transition active:scale-95 flex items-center gap-1"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <CameraCaptureButton
                      onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, icon_url: res }))}
                      label="Retake via Live Camera"
                      allowGallery={false}
                    />
                  </div>
                ) : (
                  <CameraCaptureButton
                    onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, icon_url: res }))}
                    label="Open Live Camera & Capture Logo *"
                    allowGallery={false}
                    className="!py-2.5 !border-dashed !border-indigo-300 dark:!border-indigo-700/60 hover:!border-indigo-500"
                  />
                )}
              </div>

              {/* Photo 2: Frontage Banner Photo (Optional) */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-800 dark:text-slate-200">
                    Photo 2: Frontage Banner Photo <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  {form.banner_image?.webPath && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                {form.banner_image?.webPath ? (
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-2xs">
                      <img src={form.banner_image.webPath} alt="Captured Frontage Banner" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Banner Selected
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, banner_image: null }))}
                        className="absolute top-2 right-2 px-2 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold shadow transition active:scale-95 flex items-center gap-1"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <CameraCaptureButton
                        onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, banner_image: res }))}
                        label="Retake Camera"
                        allowGallery={false}
                      />
                      <CameraCaptureButton
                        onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, banner_image: res }))}
                        label="Change Gallery"
                        allowGallery={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <CameraCaptureButton
                      onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, banner_image: res }))}
                      label="Take Photo"
                      allowGallery={false}
                    />
                    <CameraCaptureButton
                      onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, banner_image: res }))}
                      label="From Gallery"
                      allowGallery={true}
                    />
                  </div>
                )}
              </div>

              {/* Photo 3: Business Proof Document / Visiting Card Photo (Optional) */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-800 dark:text-slate-200">
                    Photo 3: Visiting Card / Proof Document <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  {form.proof_image?.webPath && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                {form.proof_image?.webPath ? (
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-2xs">
                      <img src={form.proof_image.webPath} alt="Captured Proof" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Document Selected
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, proof_image: null }))}
                        className="absolute top-2 right-2 px-2 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold shadow transition active:scale-95 flex items-center gap-1"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <CameraCaptureButton
                        onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, proof_image: res }))}
                        label="Retake Scan"
                        allowGallery={false}
                      />
                      <CameraCaptureButton
                        onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, proof_image: res }))}
                        label="Change File"
                        allowGallery={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <CameraCaptureButton
                      onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, proof_image: res }))}
                      label="Scan Document"
                      allowGallery={false}
                    />
                    <CameraCaptureButton
                      onPhotoCaptured={(res) => setForm((prev) => ({ ...prev, proof_image: res }))}
                      label="Upload File"
                      allowGallery={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. GEOLOCATION TRACKING (MANDATORY *) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pb-0.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Geolocation Tracking *</span>
              </div>

              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={geoLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                {geoLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching Region & Live GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Fetch Location</span>
                  </>
                )}
              </button>

              {form.latitude && form.longitude && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-xs space-y-1">
                  <div className="flex justify-between font-medium text-emerald-800 dark:text-emerald-300">
                    <span>Latitude:</span>
                    <span>{parseFloat(form.latitude).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-emerald-800 dark:text-emerald-300">
                    <span>Longitude:</span>
                    <span>{parseFloat(form.longitude).toFixed(5)}</span>
                  </div>
                  <div className="border-t border-emerald-200 dark:border-emerald-800/40 my-1 pt-1 flex justify-between font-medium text-indigo-600 dark:text-indigo-300">
                    <span>Detected City:</span>
                    <span>{form.city_name || "Agra"}</span>
                  </div>
                  <div className="flex justify-between font-medium text-indigo-600 dark:text-indigo-300">
                    <span>Detected State:</span>
                    <span>{form.state_name || "Uttar Pradesh"}</span>
                  </div>
                  <div className="flex justify-between font-medium text-amber-600 dark:text-amber-400">
                    <span>Postcode / Pin:</span>
                    <span>{form.postcode || "282001"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Onboarding Profile...</span>
                </>
              ) : (
                <span>Submit Onboarding Profile 🚀</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* CATEGORY SEARCH MODAL */}
      {categoryModalVisible && (
        <SearchableSelectModal
          title="Select Category"
          placeholder="Type here to search category..."
          items={categories}
          onClose={() => setCategoryModalVisible(false)}
          onSelect={(item) => {
            const catId = item.category_id || item.id;
            setForm((prev) => ({
              ...prev,
              category_id: String(catId),
              category_name: item.name,
              sub_category_id: '',
              sub_category_name: ''
            }));
            loadSubCategories(catId);
            setCategoryModalVisible(false);
          }}
        />
      )}

      {/* SUB-CATEGORY / SERVICE TYPE SEARCH MODAL */}
      {subCategoryModalVisible && (
        <SearchableSelectModal
          title="Select Service Type"
          placeholder="Type here to search service type..."
          items={subCategories}
          onClose={() => setSubCategoryModalVisible(false)}
          onSelect={(item) => {
            const subId = item.sub_category_id || item.id;
            setForm((prev) => ({
              ...prev,
              sub_category_id: String(subId),
              sub_category_name: item.name
            }));
            setSubCategoryModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

// Searchable Select Modal Component with Debounced Search
const SearchableSelectModal: React.FC<{
  title: string;
  placeholder: string;
  items: any[];
  onClose: () => void;
  onSelect: (item: any) => void;
}> = ({ title, placeholder, items, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter((item) =>
    item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-slate-800 p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-50 dark:bg-slate-950 border border-purple-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(item)}
                className="w-full p-3 rounded-2xl flex items-center justify-between text-left hover:bg-purple-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-purple-200 dark:hover:border-slate-700 transition"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                <Plus className="w-4 h-4 text-indigo-500" />
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No items found matching search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
