import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import {
  getProviderDetail,
  getCategories,
  getSubCategories,
  getStates,
  getCities,
  partnerUpdateBusiness,
  IMAGE_BASE_URL
} from '../services/api';
import { getCurrentUserLocation } from '../services/location';
import { CameraCaptureButton } from '../components/common/CameraCaptureButton';
import { CameraPhotoResult } from '../services/camera';
import {
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
  CheckCircle2,
  X,
  Navigation,
  RefreshCw,
  Search,
  Plus,
  AlertCircle
} from 'lucide-react';

export const EditBusinessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tags State
  const [currentTag, setCurrentTag] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);

  // Modals Visibility & Search States
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);
  const [existingProof, setExistingProof] = useState<string | null>(null);

  const [form, setForm] = useState({
    business_name: '',
    address: '',
    city: '',
    city_name: '',
    state: '',
    state_name: '',
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
    is_24x7_available: 0,
    owner_name: '',
    proof_image: null as CameraPhotoResult | null,
    icon_url: null as CameraPhotoResult | null,
    banner_image: null as CameraPhotoResult | null,
  });

  // Load Categories & States
  useEffect(() => {
    const initLookups = async () => {
      try {
        const [catRes, stateRes] = await Promise.all([
          getCategories(),
          getStates()
        ]);
        setCategories(catRes.data?.data || []);
        setStates(stateRes.data?.data || []);
      } catch (e) {
        console.error("Error loading lookups:", e);
      }
    };
    initLookups();
  }, []);

  // Fetch Existing Business Details
  const fetchBusinessDetails = useCallback(async () => {
    if (!id || !user?.id) return;
    setInitialLoading(true);
    try {
      const res = await getProviderDetail(Number(id), user.id);
      if (res.data?.status && res.data?.data) {
        const data = res.data.data;
        setForm({
          business_name: data.business_name || '',
          address: data.address || '',
          city: String(data.city_id || data.city || ''),
          city_name: data.city_name || '',
          state: String(data.state_id || data.state || ''),
          state_name: data.state_name || '',
          latitude: String(data.latitude || ''),
          longitude: String(data.longitude || ''),
          phone: data.phone || '',
          email: data.email || '',
          category_id: String(data.category_id || ''),
          category_name: data.category_name || '',
          sub_category_id: String(data.sub_category_id || ''),
          sub_category_name: data.sub_category_name || '',
          working_from: data.working_from || '',
          working_to: data.working_to || '',
          is_24x7_available: Number(data.is_24x7_available || 0),
          owner_name: data.owner_name || '',
          proof_image: null,
          icon_url: null,
          banner_image: null,
        });

        // Parse tags
        if (data.tags) {
          const rawTags = typeof data.tags === 'string' ? data.tags.split(',') : data.tags;
          setTagsArray(rawTags.map((t: string) => t.trim()).filter(Boolean));
        }

        // Images
        setExistingLogo(data.icon_url || null);
        setExistingBanner(data.banner_image || null);
        setExistingProof(data.proof_image || null);

        // Load sub-categories if category exists
        if (data.category_id) {
          getSubCategories(Number(data.category_id))
            .then((sc) => setSubCategories(sc.data?.data || []))
            .catch(() => {});
        }

        // Load cities if state exists
        if (data.state_id || data.state) {
          getCities(Number(data.state_id || data.state))
            .then((c) => setCities(c.data?.data || []))
            .catch(() => {});
        }
      } else {
        setFormMsg({ type: 'error', text: 'Business listing not found or unauthorized.' });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Error loading business details.' });
    } finally {
      setInitialLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  // Handle Category select
  const handleSelectCategory = async (cat: any) => {
    setForm((prev) => ({
      ...prev,
      category_id: String(cat.category_id || cat.id),
      category_name: cat.name,
      sub_category_id: '',
      sub_category_name: '',
    }));
    setCategoryModalVisible(false);
    try {
      const res = await getSubCategories(Number(cat.category_id || cat.id));
      setSubCategories(res.data?.data || []);
    } catch (e) {
      setSubCategories([]);
    }
  };

  // Handle State select
  const handleSelectState = async (st: any) => {
    setForm((prev) => ({
      ...prev,
      state: String(st.id || st.state_id),
      state_name: st.name || st.state_name,
      city: '',
      city_name: '',
    }));
    try {
      const res = await getCities(Number(st.id || st.state_id));
      setCities(res.data?.data || []);
    } catch (e) {
      setCities([]);
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const val = currentTag.trim();
    if (val && !tagsArray.includes(val)) {
      setTagsArray((prev) => [...prev, val]);
      setCurrentTag('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (index: number) => {
    setTagsArray((prev) => prev.filter((_, i) => i !== index));
  };

  // GPS Location Locator
  const handleGetLocation = async () => {
    setGeoLoading(true);
    try {
      const loc = await getCurrentUserLocation();
      if (loc) {
        setForm((prev) => ({
          ...prev,
          latitude: String(loc.latitude),
          longitude: String(loc.longitude),
        }));
        setFormMsg({ type: 'success', text: `GPS Location updated: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` });
      }
    } catch (e) {
      setFormMsg({ type: 'error', text: 'Could not fetch GPS location. Please allow location permissions.' });
    } finally {
      setGeoLoading(false);
    }
  };

  // Submit Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user?.id) return;

    if (!form.business_name.trim()) {
      setFormMsg({ type: 'error', text: 'Please enter business name.' });
      return;
    }

    setLoading(true);
    setFormMsg(null);

    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('business_name', form.business_name);
      formData.append('owner_name', form.owner_name);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      formData.append('address', form.address);
      formData.append('category_id', form.category_id);
      formData.append('sub_category_id', form.sub_category_id);
      formData.append('state', form.state);
      formData.append('city', form.city);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('working_from', form.working_from);
      formData.append('working_to', form.working_to);
      formData.append('is_24x7_available', String(form.is_24x7_available));
      formData.append('tags', tagsArray.join(', '));

      // Append new images if selected
      if (form.icon_url?.blob) {
        formData.append('icon_url', form.icon_url.blob, 'logo.jpg');
      }
      if (form.banner_image?.blob) {
        formData.append('banner_image', form.banner_image.blob, 'banner.jpg');
      }
      if (form.proof_image?.blob) {
        formData.append('proof_image', form.proof_image.blob, 'proof.jpg');
      }

      const res = await partnerUpdateBusiness(Number(id), formData);

      if (res.data?.status) {
        setFormMsg({ type: 'success', text: 'Business listing updated successfully!' });
        setTimeout(() => {
          navigate('/partner/my-businesses');
        }, 1200);
      } else {
        setFormMsg({ type: 'error', text: res.data?.message || 'Update failed' });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Error updating business' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Header />
        <div className="py-28 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading business details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-2xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            ID: #{id}
          </span>
        </div>

        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Edit Business Listing</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your business profile, contact details, working hours, address & media.
          </p>
        </div>

        {/* Feedback Alert */}
        {formMsg && (
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            formMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{formMsg.text}</span>
            </div>
            <button onClick={() => setFormMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Basic Information */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Basic Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Shop Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Agrawal Auto Spares"
                  value={form.business_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner / Contact Person Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Full name of business owner"
                  value={form.owner_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="business@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Category Selection */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              2. Category & Industry
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Main Category *
                </label>
                <div
                  onClick={() => setCategoryModalVisible(true)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium cursor-pointer flex items-center justify-between"
                >
                  <span className={form.category_name ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                    {form.category_name || 'Select Category...'}
                  </span>
                  <Grid className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Category
                </label>
                <div
                  onClick={() => {
                    if (subCategories.length > 0) setSubCategoryModalVisible(true);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center justify-between ${
                    subCategories.length > 0 ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className={form.sub_category_name ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                    {form.sub_category_name || (subCategories.length > 0 ? 'Select Sub-Category...' : 'None Available')}
                  </span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Address & Location */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                3. Address & Geolocation
              </h2>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
              >
                <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                <span>{geoLoading ? 'Detecting...' : 'Update GPS'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Address
              </label>
              <textarea
                rows={2}
                placeholder="Shop number, Street, Landmark, Area..."
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  placeholder="27.1767"
                  value={form.latitude}
                  onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  placeholder="78.0081"
                  value={form.longitude}
                  onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Working Hours & Availability */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              4. Working Hours & Timings
            </h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Open 24x7 Hours
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Business is accessible round-the-clock
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.is_24x7_available === 1}
                onChange={(e) => setForm((prev) => ({ ...prev, is_24x7_available: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {form.is_24x7_available === 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Time (From)
                  </label>
                  <input
                    type="time"
                    value={form.working_from}
                    onChange={(e) => setForm((prev) => ({ ...prev, working_from: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Closing Time (To)
                  </label>
                  <input
                    type="time"
                    value={form.working_to}
                    onChange={(e) => setForm((prev) => ({ ...prev, working_to: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Search Tags */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              5. Search Tags & Keywords
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. car repair, puncture, tyre replacement"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
              >
                + Add Tag
              </button>
            </div>

            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsArray.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Photos & Logo */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              6. Photos & Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Logo / Icon */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Business Logo / Icon
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {form.icon_url?.webPath ? (
                      <img src={form.icon_url.webPath} alt="New Logo" className="w-full h-full object-cover" />
                    ) : existingLogo ? (
                      <img src={existingLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <CameraCaptureButton
                    onPhotoCaptured={(photo: CameraPhotoResult) => setForm((prev) => ({ ...prev, icon_url: photo }))}
                    label="Change Logo"
                    allowGallery={true}
                    className="flex-1 text-xs"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Shop Banner / Cover Photo
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {form.banner_image?.webPath ? (
                      <img src={form.banner_image.webPath} alt="New Banner" className="w-full h-full object-cover" />
                    ) : existingBanner ? (
                      <img src={existingBanner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <CameraCaptureButton
                    onPhotoCaptured={(photo: CameraPhotoResult) => setForm((prev) => ({ ...prev, banner_image: photo }))}
                    label="Change Banner"
                    allowGallery={true}
                    className="flex-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Business Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Category Selection Modal */}
      {categoryModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select Category</h3>
              <button onClick={() => setCategoryModalVisible(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {categories.map((cat) => (
                <div
                  key={cat.category_id || cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-semibold flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  {form.category_id === String(cat.category_id || cat.id) && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Category Selection Modal */}
      {subCategoryModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select Sub-Category</h3>
              <button onClick={() => setSubCategoryModalVisible(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {subCategories.map((sc) => (
                <div
                  key={sc.sub_category_id || sc.id}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      sub_category_id: String(sc.sub_category_id || sc.id),
                      sub_category_name: sc.name,
                    }));
                    setSubCategoryModalVisible(false);
                  }}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-semibold flex items-center justify-between"
                >
                  <span>{sc.name}</span>
                  {form.sub_category_id === String(sc.sub_category_id || sc.id) && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
