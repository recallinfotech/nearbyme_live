import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { partnerBusinesses, getUserClaimRequests, toggleProviderStatus, deleteProviderListing } from '../services/api';
import {
  ArrowLeft,
  Building2,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  X,
  Power
} from 'lucide-react';

export const MyBusinessesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [claimRequests, setClaimRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'disabled' | 'pending' | 'claimed'>('all');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchBusinesses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [bizRes, claimRes] = await Promise.all([
        partnerBusinesses(user.id).catch(() => ({ data: { data: [] } })),
        getUserClaimRequests(user.id).catch(() => ({ data: { data: [] } }))
      ]);

      if (bizRes.data?.data) {
        const list = Array.isArray(bizRes.data.data) ? bizRes.data.data : (bizRes.data.data.data || []);
        setBusinesses(list);
      }

      if (claimRes.data?.data) {
        const claims = Array.isArray(claimRes.data.data) ? claimRes.data.data : [];
        setClaimRequests(claims);
      }
    } catch (err) {
      console.error("Error fetching partner businesses & claims:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Combine listings with pending claims that might not yet be transferred
  const allListings = useMemo(() => {
    const list = [...businesses];
    const existingProviderIds = new Set(list.map((b) => Number(b.provider_id || b.id)));

    // Append pending claim requests that are not yet in the approved list
    claimRequests.forEach((c) => {
      if (!existingProviderIds.has(Number(c.provider_id)) && c.status === 'pending') {
        list.push({
          provider_id: c.provider_id,
          business_name: c.business_name,
          phone: c.business_phone,
          address: c.address,
          city: c.city,
          category_name: c.category_name,
          icon_url: c.icon_url,
          status: 'claim_pending',
          is_claim: true,
          claim_status: 'pending',
          notes: c.notes,
        });
      }
    });

    return list;
  }, [businesses, claimRequests]);

  const filteredBusinesses = useMemo(() => {
    return allListings.filter((b) => {
      const q = search.toLowerCase().trim();
      const matchesQuery = (b.business_name || b.name || '').toLowerCase().includes(q) || (b.phone || '').includes(q);
      const isApproved = (b.is_verified === 1 || b.status === 'approved' || b.is_approved === 1) && b.status !== 'disabled';
      const isDisabled = b.status === 'disabled';
      const isPending = !isApproved && !isDisabled && b.status !== 'claim_pending';
      const isClaimed = b.is_claim || claimRequests.some((c) => Number(c.provider_id) === Number(b.provider_id || b.id) && c.status === 'approved');

      if (filter === 'approved') return matchesQuery && isApproved;
      if (filter === 'disabled') return matchesQuery && isDisabled;
      if (filter === 'pending') return matchesQuery && isPending;
      if (filter === 'claimed') return matchesQuery && isClaimed;
      return matchesQuery;
    });
  }, [allListings, search, filter, claimRequests]);

  // Handle Pause / Resume toggle
  const handleToggleStatus = async (e: React.MouseEvent, biz: any) => {
    e.stopPropagation();
    const provId = Number(biz.provider_id || biz.id);
    if (!provId || !user?.id) return;

    if (biz.status !== 'approved' && biz.status !== 'disabled') {
      showToast("Only approved businesses can be paused or resumed.", "error");
      return;
    }

    setActionLoadingId(provId);
    try {
      const res = await toggleProviderStatus(provId, user.id);
      if (res.data?.status) {
        const newStatus = res.data.new_status;
        setBusinesses((prev) =>
          prev.map((item) =>
            Number(item.provider_id || item.id) === provId ? { ...item, status: newStatus } : item
          )
        );
        showToast(res.data.message || (newStatus === 'disabled' ? 'Business paused / hidden' : 'Business re-activated!'), 'success');
      } else {
        showToast(res.data?.message || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Server error while toggling status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Delete confirmation
  const handleOpenDelete = (e: React.MouseEvent, biz: any) => {
    e.stopPropagation();
    setBusinessToDelete(biz);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!businessToDelete || !user?.id) return;
    const provId = Number(businessToDelete.provider_id || businessToDelete.id);
    if (!provId) return;

    setDeleteLoading(true);
    try {
      const res = await deleteProviderListing(provId, user.id);
      if (res.data?.status) {
        setBusinesses((prev) => prev.filter((item) => Number(item.provider_id || item.id) !== provId));
        setDeleteModalOpen(false);
        setBusinessToDelete(null);
        showToast(res.data.message || 'Business listing deleted permanently.', 'success');
      } else {
        showToast(res.data?.message || 'Failed to delete listing', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting business listing', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top duration-300">
          <div className={`p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
          }`}>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 text-xs font-bold shadow-sm active:scale-95 transition"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>Claim Business</span>
            </button>

            <button
              onClick={() => navigate('/partner/add-business')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Business</span>
            </button>
          </div>
        </div>

        {/* Normal User Limit Status Banner */}
        {(!user?.is_partner || user?.provider_status !== 'approved') && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="font-bold text-indigo-950 dark:text-indigo-200">
                Normal User Account (Max 2 Free Listings)
              </span>
            </div>
            <span className="font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {businesses.length} / 2 Used
            </span>
          </div>
        )}

        {/* Title Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>My Listed Businesses</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Edit, pause, activate or delete your business listings ({allListings.length} total)
            </p>
          </div>

          <button
            onClick={fetchBusinesses}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs active:scale-95 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search business name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { key: 'all', label: 'All' },
              { key: 'approved', label: 'Active' },
              { key: 'disabled', label: 'Paused' },
              { key: 'pending', label: 'Pending' },
              { key: 'claimed', label: 'Claimed' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition ${
                  filter === tab.key
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Loading your listed businesses...</p>
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="space-y-3 pt-1">
            {filteredBusinesses.map((b, idx) => {
              const provId = Number(b.provider_id || b.id);
              const isApproved = (b.is_verified === 1 || b.status === 'approved' || b.is_approved === 1) && b.status !== 'disabled';
              const isDisabled = b.status === 'disabled';
              const isClaimPending = b.status === 'claim_pending';
              const isClaimedApproved = claimRequests.some((c) => Number(c.provider_id) === Number(provId) && c.status === 'approved');
              const logoUrl = b.icon_url || b.logo || b.banner_image;
              const isCurrentActionLoading = actionLoadingId === provId;

              return (
                <div
                  key={provId ? `biz-${provId}-${idx}` : `biz-idx-${idx}`}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 space-y-3 transition"
                >
                  {/* Business Top Info Row */}
                  <div
                    onClick={() => provId && navigate(`/providers/${provId}`)}
                    className="flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 p-1 shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={b.business_name || b.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {b.business_name || b.name}
                          </h3>
                          {(isClaimedApproved || b.is_claim) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                              Claimed
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{b.phone}</span>
                          {b.category_name && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium ml-1 truncate">
                              • {b.category_name}
                            </span>
                          )}
                        </p>

                        {b.address && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{b.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isClaimPending ? (
                        <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Claim Pending</span>
                        </span>
                      ) : isDisabled ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1">
                          <PauseCircle className="w-3 h-3 text-amber-600" />
                          <span>Paused</span>
                        </span>
                      ) : isApproved ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar (Pause / Resume, Edit, Delete) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Status Toggle Action Button */}
                    <div>
                      {isApproved && (
                        <button
                          type="button"
                          disabled={isCurrentActionLoading}
                          onClick={(e) => handleToggleStatus(e, b)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                          title="Pause / Hide from public search"
                        >
                          <PauseCircle className={`w-3.5 h-3.5 text-amber-600 ${isCurrentActionLoading ? 'animate-spin' : ''}`} />
                          <span>Pause Listing</span>
                        </button>
                      )}

                      {isDisabled && (
                        <button
                          type="button"
                          disabled={isCurrentActionLoading}
                          onClick={(e) => handleToggleStatus(e, b)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                          title="Resume and show on search"
                        >
                          <PlayCircle className={`w-3.5 h-3.5 text-emerald-600 ${isCurrentActionLoading ? 'animate-spin' : ''}`} />
                          <span>Resume (Activate)</span>
                        </button>
                      )}

                      {!isApproved && !isDisabled && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic">
                          Under Admin Review
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (provId) navigate(`/partner/edit-business/${provId}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                        title="Edit Business Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(e, b)}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/40 transition active:scale-95"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Businesses Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No business listings match your current search or filter criteria.
            </p>
            <button
              onClick={() => navigate('/partner/add-business')}
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs shadow-2xs active:scale-95 transition"
            >
              Add New Business Listing
            </button>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteModalOpen && businessToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Business Listing?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {businessToDelete.business_name || businessToDelete.name}
                </strong>
                ? All details, unlock records, and contacts will be permanently removed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBusinessToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
