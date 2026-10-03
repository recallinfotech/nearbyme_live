import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Scale,
  CreditCard,
  PhoneOff,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ExternalLink,
  Navigation,
  BookOpen,
} from 'lucide-react';

export const TermsPage: React.FC = () => {
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
                <span className="truncate">Terms and Conditions</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  Legal
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Nearby Me • Recall IT Solutions LLP</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/privacy')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition whitespace-nowrap"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20">
              <Scale className="w-4 h-4 text-amber-300" />
              <span>User Terms of Service &amp; Agreement</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terms and Conditions</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Effective Date: <strong>September 6, 2026</strong>
              </span>
              <span>•</span>
              <span>Last Updated: <strong>September 6, 2026</strong></span>
            </div>
          </div>
        </div>

        {/* Preamble */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            These Terms and Conditions (&quot;Terms&quot;, &quot;Agreement&quot;) govern your access to and use of the <strong>Nearby Me</strong> mobile application and related web platforms, owned and maintained by <strong>Recall IT Solutions LLP</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              By registering, browsing, or using the Platform, you agree to comply with and be legally bound by these Terms.
            </p>
          </div>
        </div>

        {/* Section 1: Account Registration & User Quota */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Registration &amp; User Quota</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Eligibility, listing limits &amp; authenticity rules</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">👤 Eligibility:</strong>
              Users must be at least <strong>18 years old</strong> to create an account, list services, post rentals, or promote events.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📦 Listing Quota:</strong>
              Standard user accounts are entitled to a maximum of <strong>two (2) active listings</strong> across general categories (Jobs, Buy &amp; Sell, Rentals) per verified mobile number.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">🛡️ Listing Authenticity:</strong>
              Users agree to post accurate, lawful information. Misleading employment offers, illegal products, counterfeit goods, or misstated rental properties are strictly prohibited.
            </div>
          </div>
        </div>

        {/* Section 2: Mandatory Real-Time Geo-Location for Listings & Events */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mandatory Real-Time Geo-Location for Listings &amp; Events</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Physical site verification &amp; proximity enforcement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">📍 Physical Site Verification</strong>
              <p className="text-slate-600 dark:text-slate-300">
                When creating a business storefront listing or publishing an event, the publisher must submit the listing from the physical site where the establishment or event exists.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">🛰️ Real-Time GPS Capture</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Nearby Me automatically fetches and attaches the device&apos;s real-time GPS coordinates at submission. Manual or spoofed location entries to deceive users are strictly prohibited and will lead to immediate listing termination.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">🎯 Hyperlocal Delivery</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Services, merchant shops, and events are delivered to consumers strictly based on their physical distance relative to these geo-tagged coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Business Profile Claiming */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business Profile Claiming (&quot;Claim Your Business&quot;)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ownership transfer &amp; management protocols</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">🔍 Claim Process</strong>
              <p className="text-slate-600 dark:text-slate-300">
                If an establishment or local business profile is registered under your verified phone number by an authorized partner or field agent, you may claim official ownership.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">📱 Mobile OTP Validation</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Ownership transfer requires mobile OTP validation (and matching business card or shop proof where applicable).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">👑 Administrative Authority</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Upon verification, complete administrative authority over the listing is transferred to your account to edit, update, or remove the profile.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Listing Partner Program, Verification & UPI Settlements */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
              4
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Listing Partner Program, Verification &amp; UPI Settlements</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Partner guidelines, manual review &amp; payout mechanisms</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📝 Approval Required:</strong>
              Any user wishing to become a Listing Partner must apply in-app. Privileges are granted only after manual review by Recall IT Solutions LLP administrators.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📸 Mandatory Pre-Moderation:</strong>
              All business and merchant storefront listings submitted by partners remain unlisted until storefront photos and visiting cards are verified by our moderation team.
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 space-y-1">
              <strong className="block text-emerald-900 dark:text-emerald-300 font-bold">💳 Settlement Exclusively via UPI:</strong>
              <p>• Partner rewards or listing compensation are paid strictly via Unified Payments Interface (UPI) to the partner&apos;s verified UPI ID / VPA.</p>
              <p>• Payouts are contingent upon listing approval and public publishing. Disapproved, inactive, or duplicate listings are ineligible for settlement.</p>
              <p>• <strong>No bank transfers (NEFT/IMPS) or cash payouts are supported.</strong></p>
            </div>
          </div>
        </div>

        {/* Section 5: In-App Wallet (Razorpay) & Daily Event Billing Model */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              5
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">In-App Wallet (Razorpay) &amp; Daily Event Billing Model</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Razorpay top-ups, midnight scheduler &amp; wallet rules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">💳 Wallet Top-ups via Razorpay:</strong>
              Adding funds to the in-app wallet is facilitated exclusively via the Razorpay payment gateway. Funds added to the wallet are strictly for platform service usage.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">📅 Daily Event Billing:</strong>
              Publishing local events and gatherings is billed on a per-day schedule.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">⏰ Midnight Scheduled Deduction (Cron Job):</strong>
              Daily event fees are automatically deducted from the organizer&apos;s in-app wallet balance every night at <strong>01:00 AM IST</strong> via an automated backend scheduler.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">⏸️ Depleted Wallet Suspension &amp; No Refunds:</strong>
              If the wallet lacks sufficient balance at 01:00 AM IST, the event is immediately suspended and hidden from public search until topped up. Wallet funds consumed for active event visibility are strictly non-refundable.
            </div>
          </div>
        </div>

        {/* Section 6: Contact Unlocks, "My Phonebook" (30-Day Access) & Telecom Disclaimer */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/40 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base">
              6
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact Unlocks, &quot;My Phonebook&quot; (30-Day Access) &amp; Telecom Disclaimer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Micro-transactions, 30-day temporary retention &amp; non-liability</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5">💰 Micro-Transaction Unlock Fee:</strong>
              To obtain contact numbers for specific verified service providers or merchants, Nearby Me levies a nominal access fee ranging from <strong>₹3 to ₹10 per contact unlock</strong>, depending on the service category. Fees are deducted instantly from the user&apos;s wallet or paid via Razorpay.
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block mb-0.5">📖 &quot;My Phonebook&quot; 30-Day Temporary Access:</strong>
              <p>• Once a service provider&apos;s number is unlocked, it is stored in the user&apos;s in-app &quot;My Phonebook&quot; for easy re-dialing and reference.</p>
              <p>• All entries in &quot;My Phonebook&quot; are temporary and expire automatically after <strong>thirty (30) days</strong> from the unlock timestamp. After 30 days, the entry is cleared. Continued access requires a new unlock inquiry.</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                <PhoneOff className="w-4 h-4" />
                <span>Telecommunication Disclaimer &amp; Complete Non-Liability:</span>
              </div>
              <p className="leading-relaxed">
                Recall IT Solutions LLP facilitates access to contact numbers submitted by service providers. We do not guarantee that the service provider will answer, keep their phone powered on, remain within network reach, or accept the service assignment.
              </p>
              <p className="leading-relaxed">
                <strong>The Company shall bear no responsibility or liability if a service provider&apos;s phone is switched off, unreachable, busy, out of coverage, disconnected, or unanswered.</strong>
              </p>
              <p className="leading-relaxed font-bold text-rose-800 dark:text-rose-300">
                All contact unlock fees are 100% non-refundable. No refunds, wallet credits, or replacement leads will be issued for unanswered, busy, or unreachable calls.
              </p>
            </div>
          </div>
        </div>

        {/* Section 7: Platform Role & Limitation of Liability */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              7
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Role &amp; Limitation of Liability</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intermediary role definition</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">🌐 Intermediary Status:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Nearby Me operates strictly as a hyperlocal discovery engine and directory intermediary.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">❌ No Endorsement:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                Recall IT Solutions LLP does not inspect, warrant, or guarantee the quality, safety, legality, or execution of offline jobs, rental agreements, marketplace transactions, or professional services arranged between users.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <strong className="text-slate-900 dark:text-white block mb-1">🤝 Independent Dealings:</strong>
              <p className="text-slate-600 dark:text-slate-300">
                All commercial, financial, and personal interactions between users occur entirely at the parties&apos; own risk.
              </p>
            </div>
          </div>
        </div>

        {/* Section 8: Account Termination */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              8
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Termination</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Suspension &amp; breach clauses</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            We reserve the right to suspend or terminate accounts, remove listings, or block platform access without notice if a user violates these Terms, abuses the listing quota, conducts fraudulent transactions, or misuses the UPI payout system.
          </p>
        </div>

        {/* Section 9: Governing Law & Jurisdiction */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              9
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Governing Law &amp; Jurisdiction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dispute resolution under Indian law</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            These Terms are governed by and construed under the laws of the Republic of India. Any legal dispute or proceeding arising out of or related to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Agra, Uttar Pradesh, India</strong>.
          </p>
        </div>

        {/* Section 10: Contact Information */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 shadow-md space-y-4">
          <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
              10
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official company &amp; legal address</p>
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
            onClick={() => navigate('/privacy')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            Read Privacy Policy <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
