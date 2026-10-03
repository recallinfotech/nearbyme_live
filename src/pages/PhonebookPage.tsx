import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUnlockedBusinesses } from '../services/api';
import { BookOpen, Phone, MessageCircle, Search, RefreshCw, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PhonebookPage: React.FC = () => {
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await getUnlockedBusinesses(user.id);
        if (res.data?.data) {
          const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
          setContacts(list);
        }
      } catch (err) {
        console.error("Error loading phonebook contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const q = searchTerm.toLowerCase().trim();
    return contacts.filter((item) => {
      const name = (item.business_name || item.name || '').toLowerCase();
      const phone = (item.phone || '').toLowerCase();
      const cat = (item.category_name || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || cat.includes(q);
    });
  }, [contacts, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Back Link & Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <span>{t('myPhonebook')}</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('contactDetails')}
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
            {contacts.length} {t('unlocked')}
          </span>
        </div>

        {!user ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('accountMenu')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('loginToManage')}
              </p>
            </div>
            <button
              onClick={() => navigate('/auth/login')}
              className="py-3 px-6 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30"
            >
              {t('loginRegister')}
            </button>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-sm">
              <div className="flex items-center px-3 gap-2">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Contacts Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs font-semibold">{t('pleaseWait')}</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredContacts.map((contact, idx) => {
                  const phone = contact.phone || '';
                  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

                  return (
                    <div
                      key={contact.id ? `unl-${contact.id}-${idx}` : `unl-idx-${idx}`}
                      className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
                            {contact.business_name || contact.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
                            {t('unlocked')} ✓
                          </span>
                        </div>

                        {contact.category_name && (
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 block line-clamp-1">
                            📁 {localize(contact.category_name)}
                          </span>
                        )}

                        {contact.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal line-clamp-1">
                            📍 {contact.address}
                          </p>
                        )}

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1 tracking-wider">
                          📞 {phone}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <a
                          href={`tel:${phone}`}
                          className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{t('call')}</span>
                        </a>

                        <a
                          href={`https://wa.me/${formattedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('whatsapp')}</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl space-y-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('noDataFound')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('contactDetails')}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default PhonebookPage;
