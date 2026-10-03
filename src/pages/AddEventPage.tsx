import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getEventCategories, getEventPackages, addEvent } from '../services/api';
import { getCurrentUserLocation, reverseGeocode } from '../services/location';
import { CameraCaptureButton } from '../components/common/CameraCaptureButton';
import { CameraPhotoResult } from '../services/camera';
import {
  Calendar,
  ArrowLeft,
  Clock,
  MapPin,
  DollarSign,
  Camera,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Wallet,
  Sparkles,
  AlertCircle,
  Briefcase,
  ShoppingBag,
  Home,
  Tag,
  Building2,
  FileText,
  ShieldCheck,
  Phone,
  MessageSquare,
  Globe
} from 'lucide-react';

type ListingType = 'job' | 'item_sale' | 'rental' | 'event';

export const AddEventPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  // Listing Type State (Default to Job)
  const [listingType, setListingType] = useState<ListingType>('job');

  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Common Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  const [website, setWebsite] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<CameraPhotoResult | null>(null);

  // Job Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobEligibility, setJobEligibility] = useState('');
  const [jobType, setJobType] = useState('Full-time');

  // Purana Saman / Sale Item Fields
  const [itemPrice, setItemPrice] = useState('');
  const [itemBrandModel, setItemBrandModel] = useState('');
  const [itemCondition, setItemCondition] = useState('Like New');

  // Rentals Fields
  const [rentalType, setRentalType] = useState('1 / 2 / 3 BHK Flat');
  const [rentalPrice, setRentalPrice] = useState('');
  const [rentalDeposit, setRentalDeposit] = useState('');
  const [rentalFurnishing, setRentalFurnishing] = useState('Semi-Furnished');

  // Event Specific Fields
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryFee, setEntryFee] = useState('0');
  const [maxPeople, setMaxPeople] = useState('');

  // Package & Billing
  const [packageId, setPackageId] = useState('');
  const [durationDays, setDurationDays] = useState('2'); // Default Minimum 2 Days

  // Fetch Categories based on Type
  const loadCategories = async (type: string) => {
    try {
      const res = await getEventCategories({ type });
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (e) {
      console.error("Error loading categories for type:", e);
    }
  };

  // Fetch Packages based on Type (Jobs, Sell Items, Rentals, Events)
  const loadPackages = async (type: string) => {
    try {
      const pkgsRes = await getEventPackages({ type }).catch(() => ({ data: { data: [] } }));
      if (pkgsRes.data?.data) {
        const pkgList = pkgsRes.data.data;
        setPackages(pkgList);
        if (pkgList.length > 0) {
          setPackageId(String(pkgList[0].id));
        }
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  };

  useEffect(() => {
    loadCategories(listingType);
    loadPackages(listingType);
    setCategoryId('');
  }, [listingType]);

  // GPS Location Fetch
  const handleFetchLocation = async () => {
    setGeoLoading(true);
    try {
      const loc = await getCurrentUserLocation();
      if (!loc) {
        alert("GPS Location access denied. Please enable device GPS.");
        setGeoLoading(false);
        return;
      }
      const latStr = loc.latitude.toString();
      const lngStr = loc.longitude.toString();
      setLatitude(latStr);
      setLongitude(lngStr);

      // Automatically fetch human-readable address from GPS coordinates
      const readableAddress = await reverseGeocode(loc.latitude, loc.longitude);
      if (readableAddress) {
        setAddress(readableAddress);
      } else if (!address) {
        setAddress(`Lat: ${loc.latitude.toFixed(6)}, Lng: ${loc.longitude.toFixed(6)}`);
      }

      alert(`Location Captured Successfully! ✅\n📍 ${readableAddress || `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}`}`);
    } catch (err) {
      alert("GPS Capture failed. Please enter address manually.");
    } finally {
      setGeoLoading(false);
    }
  };

  // Cost & Wallet Calculations
  const selectedPackage = packages.find((p) => String(p.id) === String(packageId));
  const pricePerDay = selectedPackage ? Number(selectedPackage.price_per_day || selectedPackage.price || 20) : 20;
  const days = Math.max(1, Number(durationDays) || 1);
  const totalAmount = days * pricePerDay;
  const walletBalance = Number(user?.wallet_balance || 0);
  const isInsufficient = walletBalance < totalAmount;

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title for your listing.");
      return;
    }

    if (!latitude || !longitude) {
      alert("Please click 'Fetch Current Location' to pin your listing location.");
      return;
    }    if (days < 2) {
      alert("Minimum duration for ad promotion is 2 days (विज्ञापन लगाने के लिए न्यूनतम 2 दिन आवश्यक हैं).");
      return;
    }

    if (isInsufficient) {
      alert(`Insufficient wallet balance! (Required: ₹${totalAmount}, Available: ₹${walletBalance}). Please add money to your wallet.`);
      navigate('/wallet');
      return;
    }

    setLoading(true);
    setFormMsg(null);

    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('listing_type', listingType);
      formData.append('title', title.trim());
      formData.append('package_id', String(packageId || 1));
      formData.append('duration_days', String(days));
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));

      if (categoryId) formData.append('category_id', String(categoryId));
      if (address.trim()) formData.append('address', address.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (contactNumber.trim()) formData.append('contact_number', contactNumber.trim());
      if (whatsappNumber.trim()) formData.append('whatsapp_number', whatsappNumber.trim());
      if (website.trim()) formData.append('website', website.trim());

      // Type-specific field attachments
      if (listingType === 'job') {
        if (companyName) formData.append('company_name', companyName.trim());
        if (jobSalary) formData.append('job_salary', jobSalary.trim());
        if (jobEligibility) formData.append('job_eligibility', jobEligibility.trim());
        if (jobType) formData.append('job_type', jobType);
        formData.append('unlock_price', '10'); // 10 coins for job unlock
      } else if (listingType === 'item_sale') {
        if (itemPrice) formData.append('item_price', itemPrice);
        if (itemBrandModel) formData.append('item_brand_model', itemBrandModel.trim());
        if (itemCondition) formData.append('item_condition', itemCondition);
        formData.append('unlock_price', '5'); // 5 coins for item unlock
      } else if (listingType === 'rental') {
        if (rentalType) formData.append('rental_type', rentalType);
        if (rentalPrice) formData.append('rental_price', rentalPrice);
        if (rentalDeposit) formData.append('rental_deposit', rentalDeposit);
        if (rentalFurnishing) formData.append('rental_furnishing', rentalFurnishing);
        formData.append('unlock_price', '10'); // 10 coins for rental unlock
      } else if (listingType === 'event') {
        formData.append('event_date', eventDate || new Date().toISOString().split('T')[0]);
        if (startTime) formData.append('start_time', startTime);
        if (endTime) formData.append('end_time', endTime);
        if (entryFee) formData.append('entry_fee', entryFee);
        if (maxPeople) formData.append('max_people', maxPeople);
        formData.append('unlock_price', '5');
      }

      // Attach image file if captured
      if (capturedPhoto?.blob) {
        formData.append('image', capturedPhoto.blob, 'listing_banner.jpg');
      }

      const res = await addEvent(formData);

      if (res.data?.status || res.data?.success) {
        setFormMsg(res.data?.message || 'Listing published successfully!');
        await refreshProfile();
        setTimeout(() => {
          navigate('/events');
        }, 1500);
      } else {
        setFormMsg(res.data?.message || 'Failed to post listing.');
      }
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Error occurred while publishing listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Top Back Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </button>

          <Link
            to="/wallet"
            className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{t('availableBalance')}: ₹{walletBalance}</span>
          </Link>
        </div>

        {/* Title Heading Banner */}
        <div className="rounded-3xl p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">
            CREATE LOCAL LISTING
          </span>
          <h1 className="text-xl font-black">{t('postListing')}</h1>
          <p className="text-xs text-indigo-100 font-medium">
            Post Jobs, Old items for sale, Rentals (Shop/Home), or Community Events in your locality!
          </p>
        </div>

        {/* 1. SELECT LISTING TYPE (4 BIG MODERN BUTTONS) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
            1. Select Listing Type / श्रेणी चुनें *
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Type 1: Job */}
            <button
              type="button"
              onClick={() => setListingType('job')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition border ${
                listingType === 'job'
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-black shadow-md ring-2 ring-sky-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <Briefcase className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <span className="text-xs">{t('postJob')}</span>
            </button>

            {/* Type 2: Purana Saman Sale */}
            <button
              type="button"
              onClick={() => setListingType('item_sale')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition border ${
                listingType === 'item_sale'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-black shadow-md ring-2 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span className="text-xs">{t('postItemSale')}</span>
            </button>

            {/* Type 3: Rentals */}
            <button
              type="button"
              onClick={() => setListingType('rental')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition border ${
                listingType === 'rental'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs">{t('postRental')}</span>
            </button>

            {/* Type 4: Event */}
            <button
              type="button"
              onClick={() => setListingType('event')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition border ${
                listingType === 'event'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-md ring-2 ring-rose-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <span className="text-xs">{t('postEvent')}</span>
            </button>
          </div>
        </div>

        {formMsg && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold text-center shadow-lg">
            {formMsg}
          </div>
        )}

        {/* 2. DYNAMIC INPUT FORM */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs">
          {/* Main Title */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-extrabold mb-1">
              {listingType === 'job'
                ? `${t('jobRoleTitle')} *`
                : listingType === 'item_sale'
                ? 'Item Name / सामान का नाम *'
                : listingType === 'rental'
                ? 'Property Title / दुकान, फ्लैट या मकान का शीर्षक *'
                : `${t('eventDate')} & Title *`}
            </label>
            <input
              type="text"
              required
              placeholder={
                listingType === 'job'
                  ? 'e.g. Sales Executive / Office Assistant / Graphic Designer'
                  : listingType === 'item_sale'
                  ? 'e.g. iPhone 13 Pro 128GB / Royal Enfield Bullet 350 / Wooden Sofa Set'
                  : listingType === 'rental'
                  ? 'e.g. 2 BHK Furnished Flat for Rent / Main Market Shop / 500 Sqft Office'
                  : 'e.g. Grand Opening Ceremony / Diwali Mega Sale'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Sub-Category Dropdown */}
          {categories.length > 0 && (
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                {t('selectCategory')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="">-- Choose Relevant Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {localize(c.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ========================================================= */}
          {/* JOB SPECIFIC FIELDS */}
          {/* ========================================================= */}
          {listingType === 'job' && (
            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('companyName')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Tech Solutions / Star Showroom"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('jobType')}
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Full-time">Full-time (पूरा समय)</option>
                    <option value="Part-time">Part-time (अंशकालिक)</option>
                    <option value="Work from Home">Work from Home (घर से काम)</option>
                    <option value="Internship">Internship (इंटर्नशिप)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('salaryRange')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹15,000 - ₹25,000 / month"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('eligibility')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12th Pass / Graduate, 1+ yr exp"
                    value={jobEligibility}
                    onChange={(e) => setJobEligibility(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PURANA SAMAN / SALE ITEM FIELDS */}
          {/* ========================================================= */}
          {listingType === 'item_sale' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('askingPrice')} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 8500"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('brandModel')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S21 / Hero 2021"
                    value={itemBrandModel}
                    onChange={(e) => setItemBrandModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('condition')}
                  </label>
                  <select
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Like New">Like New (बिल्कुल नए जैसा)</option>
                    <option value="Good">Good (अच्छी स्थिति)</option>
                    <option value="Used">Fair / Used (उपयोग किया हुआ)</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* RENTALS (SHOP, OFFICE, HOME) FIELDS */}
          {/* ========================================================= */}
          {listingType === 'rental' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('propertyType')} *
                  </label>
                  <select
                    value={rentalType}
                    onChange={(e) => setRentalType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="1 / 2 / 3 BHK Flat">Flat & Apartment (फ्लैट / अपार्टमेंट)</option>
                    <option value="Commercial Shop">Commercial Shop (दुकान / शोरूम)</option>
                    <option value="Office Space">Office Space (ऑफिस स्पेस)</option>
                    <option value="Single Room / PG">Room / PG / Hostel (कमरा / पीजी)</option>
                    <option value="Independent House">Independent House (स्वतंत्र मकान)</option>
                    <option value="Godown / Warehouse">Godown / Warehouse (गोदाम)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('furnishing')}
                  </label>
                  <select
                    value={rentalFurnishing}
                    onChange={(e) => setRentalFurnishing(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Furnished">Fully Furnished (पूर्ण सुसज्जित)</option>
                    <option value="Semi-Furnished">Semi-Furnished (अर्ध सुसज्जित)</option>
                    <option value="Unfurnished">Unfurnished (बिना फर्नीचर)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('monthlyRent')} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12000"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('securityDeposit')}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 24000"
                    value={rentalDeposit}
                    onChange={(e) => setRentalDeposit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* EVENT SPECIFIC FIELDS */}
          {/* ========================================================= */}
          {listingType === 'event' && (
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {t('eventDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Entry Fee (₹) (0 for Free)</label>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Max Capacity / Seats</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={maxPeople}
                    onChange={(e) => setMaxPeople(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
              Description & Additional Details *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe details, features, requirements, terms or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Location & GPS Capture */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Location & Pinpoint GPS *</span>
              </span>

              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={geoLoading}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {geoLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                <span>{geoLoading ? 'Fetching Address...' : latitude ? 'GPS Pinned ✓' : 'Fetch GPS'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder={geoLoading ? "Fetching venue address from GPS..." : "Complete Venue / Address (e.g. Shop No 4, Sanjay Place, Agra)"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {latitude && longitude && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
                <span className="font-mono">📍 {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Coordinates Linked
                </span>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                Contact Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                WhatsApp Number
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Photo Capture */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-slate-800 dark:text-slate-200 font-bold">
              Upload Photos / Banner / Saman Image
            </label>
            {capturedPhoto?.webPath ? (
              <div className="relative h-36 rounded-2xl overflow-hidden border border-indigo-500/40">
                <img src={capturedPhoto.webPath} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <CameraCaptureButton
                onPhotoCaptured={(res) => setCapturedPhoto(res)}
                label="Take Photo / Upload Image"
                allowGallery={true}
              />
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. PROMOTION PACKAGE & DURATION WALLET BILLING */}
          {/* ========================================================= */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Promotion Duration (Min 2 Days)</span>
              </span>
              <span className="text-[11px] font-black text-purple-700 dark:text-purple-300">
                ₹{pricePerDay} / Day
              </span>
            </div>

            {/* Package Tier Selection */}
            {packages.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Select Promotion Tier / पैकेज चुनें:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {packages.map((pkg) => {
                    const isSelected = String(pkg.id) === String(packageId);
                    const rate = Number(pkg.price_per_day || pkg.price || 20);

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setPackageId(String(pkg.id))}
                        className={`p-2.5 rounded-2xl text-left border flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {pkg.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Priority #{pkg.priority || 1}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                          ₹{rate}/day
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Duration Buttons (2, 5, 7, 15, 30 Days) */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { days: '2', label: '2 Days (Min)' },
                { days: '5', label: '5 Days' },
                { days: '7', label: '7 Days' },
                { days: '15', label: '15 Days' },
                { days: '30', label: '30 Days' },
              ].map((p) => {
                const isSelected = durationDays === p.days;
                const cost = Number(p.days) * pricePerDay;

                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setDurationDays(p.days)}
                    className={`p-2 rounded-2xl text-center border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <span className="block text-[11px] font-extrabold">{p.label}</span>
                    <span className="block text-[10px] opacity-90 font-bold">₹{cost}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input Stepper */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">
                Custom Days (न्यूनतम 2 दिन):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDurationDays(String(Math.max(2, (Number(durationDays) || 2) - 1)))}
                  className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm flex items-center justify-center hover:bg-slate-200 active:scale-95 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min={2}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-14 text-center py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-xs"
                />
                <button
                  type="button"
                  onClick={() => setDurationDays(String((Number(durationDays) || 2) + 1))}
                  className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm flex items-center justify-center hover:bg-slate-200 active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Summary Pill */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 flex items-center justify-between text-xs font-black">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Total Promotion Cost</span>
                <span className="text-base text-indigo-600 dark:text-indigo-400">
                  ₹{totalAmount} ({days} Days × ₹{pricePerDay})
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Your Wallet</span>
                <span className={walletBalance >= totalAmount ? 'text-emerald-600' : 'text-rose-500 font-extrabold'}>
                  ₹{walletBalance}
                </span>
              </div>
            </div>

            {isInsufficient && (
              <p className="text-[11px] font-bold text-rose-500 text-center">
                ⚠️ Low Balance! You need ₹{totalAmount - walletBalance} more to post this listing.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition shadow-xl shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>Publish & Deduct ₹{totalAmount} 🚀</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};
export default AddEventPage;
