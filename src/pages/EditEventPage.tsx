import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  getEventDetails,
  getEventCategories,
  updateEvent,
  IMAGE_BASE_URL
} from '../services/api';
import { getCurrentUserLocation, reverseGeocode } from '../services/location';
import { CameraCaptureButton } from '../components/common/CameraCaptureButton';
import { CameraPhotoResult } from '../services/camera';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  ShoppingBag,
  Home,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Globe,
  Building2,
  Tag,
  ShieldCheck,
  RefreshCw,
  Navigation,
  Image as ImageIcon,
  Check,
  X,
  DollarSign,
  Layers,
  FileText
} from 'lucide-react';

type ListingType = 'job' | 'item_sale' | 'rental' | 'event';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [listingType, setListingType] = useState<ListingType>('job');
  const [categories, setCategories] = useState<any[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<CameraPhotoResult | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [website, setWebsite] = useState('');

  // Job Specific
  const [companyName, setCompanyName] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobEligibility, setJobEligibility] = useState('');
  const [jobType, setJobType] = useState('Full-time');

  // Item Sale Specific
  const [itemPrice, setItemPrice] = useState('');
  const [itemBrandModel, setItemBrandModel] = useState('');
  const [itemCondition, setItemCondition] = useState('Like New');

  // Rental Specific
  const [rentalType, setRentalType] = useState('1 / 2 / 3 BHK Flat');
  const [rentalPrice, setRentalPrice] = useState('');
  const [rentalDeposit, setRentalDeposit] = useState('');
  const [rentalFurnishing, setRentalFurnishing] = useState('Semi-Furnished');

  // Event Specific
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryFee, setEntryFee] = useState('0');
  const [maxPeople, setMaxPeople] = useState('');

  // Load Categories for current listing type
  const loadCategoriesForType = async (type: string) => {
    try {
      const res = await getEventCategories({ type });
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Fetch Event Details
  const fetchListingData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await getEventDetails(Number(id), user?.id || null);
      if (res.data?.status && res.data?.data) {
        const d = res.data.data;
        const type: ListingType = d.listing_type || 'job';
        setListingType(type);

        setTitle(d.title || '');
        setCategoryId(d.category_id ? String(d.category_id) : '');
        setDescription(d.description || '');
        setAddress(d.address || '');
        setLatitude(d.latitude ? String(d.latitude) : '');
        setLongitude(d.longitude ? String(d.longitude) : '');
        setContactNumber(d.contact_number || '');
        setWhatsappNumber(d.whatsapp_number || '');
        setWebsite(d.website || '');

        // Specific fields
        setCompanyName(d.company_name || '');
        setJobSalary(d.job_salary || '');
        setJobEligibility(d.job_eligibility || '');
        setJobType(d.job_type || 'Full-time');

        setItemPrice(d.item_price ? String(d.item_price) : '');
        setItemBrandModel(d.item_brand_model || '');
        setItemCondition(d.item_condition || 'Like New');

        setRentalType(d.rental_type || '1 / 2 / 3 BHK Flat');
        setRentalPrice(d.rental_price ? String(d.rental_price) : '');
        setRentalDeposit(d.rental_deposit ? String(d.rental_deposit) : '');
        setRentalFurnishing(d.rental_furnishing || 'Semi-Furnished');

        setEventDate(d.event_date || '');
        setStartTime(d.start_time || '');
        setEndTime(d.end_time || '');
        setEntryFee(d.entry_fee ? String(d.entry_fee) : '0');
        setMaxPeople(d.max_people ? String(d.max_people) : '');

        // Image
        if (d.image) {
          const imgUrl = d.image.startsWith('http')
            ? d.image
            : `${IMAGE_BASE_URL}storage/events/${d.image.replace(/^\//, '')}`;
          setExistingImage(imgUrl);
        }

        // Load corresponding categories
        await loadCategoriesForType(type);
      } else {
        setErrorMsg('Listing details not found or failed to load.');
      }
    } catch (err: any) {
      console.error('Error fetching listing to edit:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load listing information.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchListingData();
  }, [fetchListingData]);

  // GPS Location Fetch
  const handleFetchLocation = async () => {
    setGeoLoading(true);
    try {
      const loc = await getCurrentUserLocation();
      if (!loc) {
        alert('GPS location access denied. Please enable device location.');
        setGeoLoading(false);
        return;
      }
      setLatitude(loc.latitude.toString());
      setLongitude(loc.longitude.toString());

      const readableAddress = await reverseGeocode(loc.latitude, loc.longitude);
      if (readableAddress) {
        setAddress(readableAddress);
      }
      setToastMsg({
        type: 'success',
        text: `Location captured: ${readableAddress || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}`
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      alert('Failed to get GPS location. You can enter the address manually.');
    } finally {
      setGeoLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user?.id) return;

    if (!title.trim()) {
      alert('Please enter a title for your listing.');
      return;
    }

    setSubmitting(true);
    setToastMsg(null);

    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('title', title.trim());
      if (categoryId) formData.append('category_id', categoryId);
      if (description) formData.append('description', description.trim());
      if (address) formData.append('address', address.trim());
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (contactNumber) formData.append('contact_number', contactNumber.trim());
      if (whatsappNumber) formData.append('whatsapp_number', whatsappNumber.trim());
      if (website) formData.append('website', website.trim());

      if (listingType === 'job') {
        if (companyName) formData.append('company_name', companyName.trim());
        if (jobSalary) formData.append('job_salary', jobSalary.trim());
        if (jobEligibility) formData.append('job_eligibility', jobEligibility.trim());
        if (jobType) formData.append('job_type', jobType);
      } else if (listingType === 'item_sale') {
        if (itemPrice) formData.append('item_price', itemPrice);
        if (itemBrandModel) formData.append('item_brand_model', itemBrandModel.trim());
        if (itemCondition) formData.append('item_condition', itemCondition);
      } else if (listingType === 'rental') {
        if (rentalType) formData.append('rental_type', rentalType);
        if (rentalPrice) formData.append('rental_price', rentalPrice);
        if (rentalDeposit) formData.append('rental_deposit', rentalDeposit);
        if (rentalFurnishing) formData.append('rental_furnishing', rentalFurnishing);
      } else if (listingType === 'event') {
        if (eventDate) formData.append('event_date', eventDate);
        if (startTime) formData.append('start_time', startTime);
        if (endTime) formData.append('end_time', endTime);
        if (entryFee) formData.append('entry_fee', entryFee);
        if (maxPeople) formData.append('max_people', maxPeople);
      }

      if (newPhoto?.blob) {
        formData.append('image', newPhoto.blob, 'updated_listing.jpg');
      }

      const res = await updateEvent(Number(id), formData);

      if (res.data?.status || res.data?.success) {
        setToastMsg({ type: 'success', text: 'Listing updated successfully! 🎉' });
        setTimeout(() => {
          navigate('/my-listings');
        }, 1200);
      } else {
        setToastMsg({ type: 'error', text: res.data?.message || 'Failed to update listing.' });
      }
    } catch (err: any) {
      console.error('Update error:', err);
      const msg = err.response?.data?.message || 'Failed to update listing. Please try again.';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeMeta = () => {
    switch (listingType) {
      case 'job':
        return {
          label: 'Job Vacancy',
          icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
          color: 'from-indigo-600 to-purple-600',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        };
      case 'item_sale':
        return {
          label: 'Purana Saman / Sale Item',
          icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
          color: 'from-amber-600 to-orange-600',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'rental':
        return {
          label: 'Rental & Property',
          icon: <Home className="w-5 h-5 text-emerald-400" />,
          color: 'from-emerald-600 to-teal-600',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'event':
      default:
        return {
          label: 'Event / Celebration',
          icon: <Calendar className="w-5 h-5 text-rose-400" />,
          color: 'from-rose-600 to-pink-600',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        };
    }
  };

  const meta = getTypeMeta();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-36 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 border ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  toastMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {toastMsg.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold truncate">{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 py-4 space-y-5">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('myListings') || 'My Listings'}</span>
          </button>

          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 ${meta.badgeBg}`}>
            {meta.icon}
            <span>{meta.label}</span>
          </span>
        </div>

        {/* Page Hero Card */}
        <div className={`p-5 rounded-3xl bg-gradient-to-r ${meta.color} text-white shadow-xl space-y-1 relative overflow-hidden`}>
          <div className="relative z-10">
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <span>Edit {meta.label}</span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-xs text-white/80 font-medium pt-0.5">
              Update listing information, images, contact details and pricing.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-9 h-9 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Loading listing details for editing...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Unable to Load Listing</h2>
            <p className="text-xs text-slate-500">{errorMsg}</p>
            <button
              onClick={() => navigate('/my-listings')}
              className="mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-xs shadow-md"
            >
              Back to My Listings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ========================================================= */}
            {/* 1. MEDIA & PHOTO SECTION */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Listing Photo / Banner
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              </div>

              {/* Photo Preview Container */}
              <div className="space-y-3">
                {newPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 bg-slate-900 aspect-video max-h-56 flex items-center justify-center shadow-md group">
                    <img
                      src={newPhoto.webPath}
                      alt="New preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow">
                        New Photo
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewPhoto(null)}
                        className="p-1.5 rounded-lg bg-slate-900/80 text-rose-400 hover:text-rose-300 backdrop-blur-md shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : existingImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video max-h-56 flex items-center justify-center shadow-sm">
                    <img
                      src={existingImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={() => setExistingImage(null)}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 text-slate-300 text-[10px] font-bold backdrop-blur-md">
                      Current Photo
                    </span>
                  </div>
                ) : null}

                {/* Photo Capture Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <CameraCaptureButton
                    label={newPhoto || existingImage ? 'Change Photo (Camera)' : 'Capture Live Photo'}
                    onPhotoCaptured={(photo) => setNewPhoto(photo)}
                    allowGallery={false}
                  />
                  <CameraCaptureButton
                    label={newPhoto || existingImage ? 'Pick from Gallery' : 'Upload from Gallery'}
                    onPhotoCaptured={(photo) => setNewPhoto(photo)}
                    allowGallery={true}
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. BASIC INFORMATION */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Basic Details
                </h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Listing Title / Headline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Video Editor / 2 BHK Flat / iPhone 13"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                {categories.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {localize(cat.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full information, perks, requirements, condition, etc..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. DYNAMIC TYPE-SPECIFIC FIELDS */}
            {/* ========================================================= */}
            {listingType === 'job' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Job Vacancy Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Company / Hiring Organization
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Tech Solutions Pvt Ltd"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job Type
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Work from Home / Remote">Work from Home / Remote</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Offered Salary (₹)
                    </label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="e.g. ₹15,000 - ₹25,000 / Month"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Eligibility / Requirements
                    </label>
                    <input
                      type="text"
                      value={jobEligibility}
                      onChange={(e) => setJobEligibility(e.target.value)}
                      placeholder="e.g. 1 Year Exp, Premiere Pro"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {listingType === 'item_sale' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Item Sale Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Asking Price (₹)
                    </label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Brand / Model
                    </label>
                    <input
                      type="text"
                      value={itemBrandModel}
                      onChange={(e) => setItemBrandModel(e.target.value)}
                      placeholder="e.g. Apple iPhone 13 (128GB)"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Condition
                    </label>
                    <select
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    >
                      <option value="Brand New / Sealed">Brand New / Sealed</option>
                      <option value="Like New">Like New</option>
                      <option value="Good Condition">Good Condition</option>
                      <option value="Fair / Used">Fair / Used</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {listingType === 'rental' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Home className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Rental & Property Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Property Type
                    </label>
                    <select
                      value={rentalType}
                      onChange={(e) => setRentalType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                      <option value="1 / 2 / 3 BHK Flat">1 / 2 / 3 BHK Flat</option>
                      <option value="Commercial Shop / Office">Commercial Shop / Office</option>
                      <option value="Individual House / Villa">Individual House / Villa</option>
                      <option value="PG / Shared Room">PG / Shared Room</option>
                      <option value="Warehouse / Godown">Warehouse / Godown</option>
                      <option value="Plot / Land">Plot / Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      value={rentalPrice}
                      onChange={(e) => setRentalPrice(e.target.value)}
                      placeholder="e.g. 12000"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={rentalDeposit}
                      onChange={(e) => setRentalDeposit(e.target.value)}
                      placeholder="e.g. 24000"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Furnishing
                    </label>
                    <select
                      value={rentalFurnishing}
                      onChange={(e) => setRentalFurnishing(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {listingType === 'event' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Event Schedule & Entry
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      placeholder="0 for Free Entry"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. LOCATION & VENUE */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Location & Venue
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={geoLoading}
                  className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
                >
                  <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                  <span>{geoLoading ? 'Fetching...' : 'GPS Auto-Capture'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Taj Ganj, Fatehabad Road, Agra, UP"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 27.1767"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 78.0081"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. CONTACT & SOCIAL DETAILS */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Calling Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Website / Portfolio (Optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SUBMIT BUTTONS (IN-FLOW & STICKY BOTTOM BAR) */}
            {/* ========================================================= */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                disabled={submitting}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditEventPage;
