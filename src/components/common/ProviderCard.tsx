import React from 'react';
import { Star, MapPin, Phone, Lock, Unlock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../../services/api';

interface ProviderCardProps {
  provider: {
    id: number;
    name: string;
    business_name?: string;
    category?: { name: string } | string;
    sub_category?: { name: string } | string;
    address?: string;
    phone?: string;
    rating?: number;
    reviews_count?: number;
    distance?: number | string;
    is_unlocked?: boolean;
    logo?: string;
    banner?: string;
    verified?: boolean;
  };
  onUnlock?: (id: number) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onUnlock }) => {
  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format&fit=crop&q=60';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path.replace(/^\//, '')}`;
  };

  const categoryName = typeof provider.category === 'object' ? provider.category?.name : provider.category;

  const formatRating = (val: any): string => {
    if (val === undefined || val === null) return '4.8';
    const num = Number(val);
    return isNaN(num) ? '4.8' : num.toFixed(1);
  };

  const formatDistance = (val: any): string => {
    if (val === undefined || val === null) return '';
    const num = Number(val);
    return isNaN(num) ? String(val) : `${num.toFixed(1)} km`;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/40 transition group flex flex-col justify-between shadow-lg">
      <div>
        {/* Banner Image */}
        <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
          <img
            src={getImageUrl(provider.banner || provider.logo)}
            alt={provider.business_name || provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format&fit=crop&q=60');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30 flex items-center gap-1 text-xs font-semibold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{formatRating(provider.rating)}</span>
          </div>

          {/* Distance */}
          {provider.distance !== undefined && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-xs font-medium text-indigo-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{formatDistance(provider.distance)}</span>
            </div>
          )}
        </div>

        {/* Business Header */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition flex items-center gap-1.5 line-clamp-1">
                {provider.business_name || provider.name}
                {provider.verified && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
              </h3>
              {categoryName && (
                <span className="inline-block mt-0.5 text-xs text-indigo-400 font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20">
                  {categoryName}
                </span>
              )}
            </div>
          </div>

          {provider.address && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{provider.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <Link
          to={`/providers/${provider.id}`}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs text-center border border-slate-700 transition flex items-center justify-center gap-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {provider.is_unlocked && provider.phone ? (
          <a
            href={`tel:${provider.phone}`}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        ) : (
          <button
            onClick={() => onUnlock && onUnlock(provider.id)}
            className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Contact</span>
          </button>
        )}
      </div>
    </div>
  );
};
