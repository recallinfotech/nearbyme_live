import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  MapPin,
  Smartphone,
  CreditCard,
  Trash2,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Navigation,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Top Navigation Bar with Proper Safe-Area Padding */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-10 sm:pt-11 pb-3 px-4 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition shrink-0"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <span className="truncate">Privacy Policy</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  Official
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Nearby Me • Recall IT Solutions LLP</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/terms')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition whitespace-nowrap"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Compliance &amp; Data Protection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Effective Date: <strong>September 6, 2026</strong>
              </span>
              <span>•</span>
              <span>Last Updated: <strong>September 6, 2026</strong></span>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Welcome to <strong>Nearby Me</strong> (&quot;App&quot;, &quot;Platform&quot;, &quot;Service&quot;), an official digital product owned, engineered, and operated by <strong>Recall IT Solutions LLP</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are dedicated to respecting your privacy and safeguarding your personal information.
          </p>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p>
              By downloading, installing, or using Nearby Me, you consent to the collection, processing, and disclosure practices outlined in this Privacy Policy. If you do not accept these terms, please do not use the Platform.
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Information We Collect</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Minimal data necessary for hyperlocal discovery &amp; services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* A. User-Provided Information */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wide">
                <Smartphone className="w-4 h-4" />
                <span>A. User-Provided Information</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Account Credentials:</strong> Full name, mobile phone number, email address, and profile photo when registering manually or through Google Sign-In.
                </li>
                <li>
                  <strong>Public Listing Content:</strong> Titles, descriptions, pricing, media files, and contact numbers submitted across:
                  <div className="ml-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                    <p>• Local job openings and hiring posts</p>
                    <p>• Buy &amp; Sell listings for pre-owned/used goods</p>
                    <p>• Real estate listings (homes, offices, shops for rent)</p>
                    <p>• Community events and local gatherings</p>
                  </div>
                </li>
                <li>
                  <strong>Standard User Limit:</strong> Standard accounts are limited to a maximum of <strong>two (2) active listings</strong> per verified phone number across general categories to control catalog quality and spam.
                </li>
              </ul>
            </div>

            {/* B. Listing Partners, Local Merchants & Mandatory Geo-Tagging */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <Navigation className="w-4 h-4" />
                <span>B. Partners, Merchants &amp; Geo-Tagging</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Partner Onboarding:</strong> Storefront details submitted subject to manual administrative review.
                </li>
                <li>
                  <strong>Mandatory Current GPS Geo-Tagging (Listings &amp; Events):</strong> When a merchant, partner, or user lists a business, store, or event, Nearby Me captures the device’s current GPS coordinates at the physical location. This real-time geo-tagging ensures listing authenticity and powers proximity search algorithms.
                </li>
                <li>
                  <strong>Verification Artifacts:</strong> Storefront photos and visiting/business cards. <em>(No corporate tax records like GSTIN or business PAN collected for standard onboarding).</em>
                </li>
                <li>
                  <strong>Disbursement Information:</strong> Valid UPI VPAs / UPI IDs for disbursing incentives. <em>We do not store bank account numbers or IFSC codes.</em>
                </li>
              </ul>
            </div>

            {/* C. Sensitive Permissions & Automated Technical Data */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                <MapPin className="w-4 h-4" />
                <span>C. Sensitive Permissions &amp; Data</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Foreground Location Data:</strong> Approximate &amp; precise coordinates collected solely while the app is active in the foreground following explicit in-app disclosure prompt to calculate proximity and enforce real-world geo-tagged locations.
                </li>
                <li>
                  <strong>No Background Tracking:</strong> Nearby Me does not track or store geographical coordinates when the application is closed or running in the background.
                </li>
                <li>
                  <strong>Camera &amp; Media Access:</strong> Accessed only on demand when uploading listing media, storefront photos, business cards, or profile pictures.
                </li>
                <li>
                  <strong>Push Notifications:</strong> Transmit listing alerts, transactions, and updates (Android 13+ compliant).
                </li>
              </ul>
            </div>

            {/* D. Financial Data, Razorpay & In-App Wallet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wide">
                <CreditCard className="w-4 h-4" />
                <span>D. Financial Data &amp; Razorpay</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Razorpay Wallet Recharges:</strong> Adding funds to your in-app wallet is processed directly and securely via Razorpay, an RBI-authorized, PCI-DSS compliant payment gateway.
                </li>
                <li>
                  <strong>No Financial Storage:</strong> Recall IT Solutions LLP does not collect, record, or store credit/debit card numbers, CVVs, net banking credentials, or UPI PINs.
                </li>
              </ul>
            </div>

            {/* E. "My Phonebook" & 30-Day Data Retention */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 md:col-span-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wide">
                <BookOpen className="w-4 h-4" />
                <span>E. &quot;My Phonebook&quot; &amp; 30-Day Data Retention</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Unlocked Lead Access:</strong> When a user pays the category unlock fee (₹3, ₹5, ₹10) to access a service provider&apos;s contact number, the revealed contact details are saved to the user&apos;s in-app &quot;My Phonebook&quot; section.
                </li>
                <li>
                  <strong>30-Day Expiry Window:</strong> To maintain data privacy, prevent unauthorized lead hoarding, and encourage up-to-date local connections, unlocked numbers stored in &quot;My Phonebook&quot; remain accessible for <strong>exactly thirty (30) days</strong>. After 30 days, the record expires and is automatically removed from the user&apos;s in-app Phonebook list.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">How We Use Your Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Purposes of data processing</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📍 Hyperlocal Service Delivery &amp; Geo-Matching:</strong>
              Indexing and filtering local listings, jobs, rental properties, and events according to real-time captured coordinates.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">🏪 Business Profile Ownership &amp; Claims:</strong>
              Facilitating the &quot;Claim Your Business&quot; mechanism via mobile OTP verification to manage, update, or remove profiles.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">💸 Partner Payout Settlement:</strong>
              Routing listing incentives to partner UPI IDs after submitted listings pass moderation and go live.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">🌙 Automated Daily Event Deductions:</strong>
              Executing automated daily deductions for paid event promotions from user in-app wallet balances every night at <strong>01:00 AM IST</strong> via scheduled backend cron jobs.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📖 Contact Access Management:</strong>
              Enabling temporary 30-day &quot;My Phonebook&quot; access to service provider phone numbers following verified fee deductions.
            </div>
          </div>
        </div>

        {/* Section 3: Disclosure of Information */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Disclosure of Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Strict no-sale policy</p>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            We do not sell, rent, or trade your personal data to external third parties. Disclosures occur only in the following contexts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">📢 Public Hyperlocal Listings:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Listing descriptions, rental details, item photos, and designated contact numbers are intentionally visible to other nearby users. Internal verification assets (such as business cards) remain private and are never displayed publicly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">⚙️ Service Providers:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Shared under confidentiality agreements with <strong>Razorpay</strong> (for processing encrypted payment gateway sessions and wallet top-ups), <strong>UPI Networks</strong> (for processing partner listing incentives), and <strong>Cloud &amp; SMS Gateways</strong> (for infrastructure hosting and OTP verification).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 sm:col-span-2">
              <strong className="text-slate-900 dark:text-white block mb-1">⚖️ Legal Obligations:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Records may be disclosed when required under Indian statutory laws, court orders, or lawful requests by government and regulatory authorities.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Data Security & Storage */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              4
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Security &amp; Storage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Industry-standard encryption &amp; protocols</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <strong className="block mb-0.5">Encryption in Transit</strong>
              All API communications are secured via HTTPS with TLS.
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <strong className="block mb-0.5">Cleartext Disabled</strong>
              Unencrypted HTTP traffic is explicitly disabled in Android configuration.
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <strong className="block mb-0.5">Role-Based Access</strong>
              Verification records are housed behind secured admin dashboards.
            </div>
          </div>
        </div>

        {/* Section 5: Data Retention & Account Deletion */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/40 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base">
              5
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Retention &amp; Account Deletion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your rights to delete your account &amp; data</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>In-App Account Deletion:</strong> You can delete your account and submitted data inside the app by going to <strong>Settings &gt; Account &gt; Delete Account</strong>.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Email Deletion Requests:</strong> You can also email <strong>info@recallinfotech.com</strong> from your registered address with the subject <em>&quot;Account Deletion Request - Nearby Me&quot;</em>.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Deletion Timeline:</strong> Upon verification, personal data and active listings will be expunged or anonymized within <strong>thirty (30) business days</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Children's Privacy */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              6
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Children&apos;s Privacy</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Audience age requirements</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Nearby Me is intended for general audiences aged <strong>18 and older</strong>. We do not knowingly solicit or collect personal information from individuals under 13 years of age. If discovered, such records are promptly deleted.
          </p>
        </div>

        {/* Section 7: Grievance Redressal & Contact Information */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 shadow-md space-y-4">
          <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
              7
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grievance Redressal &amp; Contact</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official company &amp; nodal officer details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2.5">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Operating Entity</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Recall IT Solutions LLP</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Product</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Nearby Me</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <a href="tel:+918923326462" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  +91 8923326462
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <a href="mailto:info@recallinfotech.com" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  info@recallinfotech.com
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Registered Office Address
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                25/67-D/1-A, Near Shanti Manglik Hospital,<br />
                Basai Khurd, Agra, Uttar Pradesh - 282001, India.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Back to App */}
        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <button
            onClick={() => navigate('/terms')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            Read Terms and Conditions <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
