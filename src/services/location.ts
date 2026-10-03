import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  areaName?: string;
  city?: string;
  state?: string;
  pincode?: string;
  fullAddress?: string;
  isManual?: boolean;
}

export interface SearchLocationResult {
  latitude: number;
  longitude: number;
  areaName: string;
  city: string;
  state?: string;
  fullAddress: string;
  type?: string;
}

export const POPULAR_CITIES: Array<{
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  tag?: string;
}> = [
  { name: 'Agra City (Central)', state: 'Agra, UP', latitude: 27.1767, longitude: 78.0081, tag: 'Center' },
  { name: 'Bodla', state: 'Agra, UP', latitude: 27.1850, longitude: 77.9620, tag: 'West' },
  { name: 'Sadar Bazar', state: 'Agra Cantt, UP', latitude: 27.1585, longitude: 78.0095, tag: 'Cantt' },
  { name: 'Taj Ganj', state: 'Agra, UP', latitude: 27.1650, longitude: 78.0430, tag: 'Taj Mahal' },
  { name: 'Sanjay Place', state: 'Agra, UP', latitude: 27.2000, longitude: 78.0050, tag: 'Commercial' },
  { name: 'Dayalbagh', state: 'Agra, UP', latitude: 27.2280, longitude: 78.0160, tag: 'North' },
  { name: 'Kamla Nagar', state: 'Agra, UP', latitude: 27.2150, longitude: 78.0250 },
  { name: 'Sikandra', state: 'Agra, UP', latitude: 27.2200, longitude: 77.9500, tag: 'NH-19' },
  { name: 'Shahganj', state: 'Agra, UP', latitude: 27.1700, longitude: 77.9800 },
  { name: 'Khandari', state: 'Agra, UP', latitude: 27.2080, longitude: 77.9980 },
  { name: 'Fatehabad Road', state: 'Agra, UP', latitude: 27.1550, longitude: 78.0550, tag: 'Tourist' },
  { name: 'Raja Ki Mandi', state: 'Agra, UP', latitude: 27.1950, longitude: 77.9950, tag: 'Market' },
  { name: 'Shastripuram', state: 'Agra, UP', latitude: 27.2050, longitude: 77.9350 },
  { name: 'Trans Yamuna', state: 'Agra, UP', latitude: 27.2020, longitude: 78.0450 },
  { name: 'Lohamandi', state: 'Agra, UP', latitude: 27.1900, longitude: 77.9850 },
  { name: 'MG Road', state: 'Agra, UP', latitude: 27.1800, longitude: 78.0100 },
  { name: 'Foundry Nagar', state: 'Agra, UP', latitude: 27.1950, longitude: 78.0650 },
  { name: 'Rohta (Gwalior Rd)', state: 'Agra, UP', latitude: 27.1150, longitude: 78.0050 },
];

const STORAGE_KEY_LOCATION = 'nearby_selected_location';
const STORAGE_KEY_RECENTS = 'nearby_recent_locations';

export const saveLocationToStorage = (loc: LocationCoords) => {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
  } catch (e) {
    console.error('Error saving location to storage:', e);
  }
};

export const getSavedLocationFromStorage = (): LocationCoords | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading location from storage:', e);
  }
  return null;
};

export const saveRecentLocation = (loc: LocationCoords) => {
  try {
    const recents = getRecentLocations();
    const filtered = recents.filter(
      (r) =>
        r.areaName?.toLowerCase() !== loc.areaName?.toLowerCase() &&
        Math.abs(r.latitude - loc.latitude) > 0.005 &&
        Math.abs(r.longitude - loc.longitude) > 0.005
    );
    const updated = [loc, ...filtered].slice(0, 6);
    localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving recent location:', e);
  }
};

export const getRecentLocations = (): LocationCoords[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  return [];
};

export const clearRecentLocationsStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_RECENTS);
  } catch (e) {}
};

export const checkLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    return await Geolocation.checkPermissions();
  } catch (error) {
    console.warn('Capacitor Geolocation not available on Web, using Browser API fallback');
    return { location: 'granted', coarseLocation: 'granted' };
  }
};

export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    return await Geolocation.requestPermissions();
  } catch (error) {
    return { location: 'granted', coarseLocation: 'granted' };
  }
};

export const getAreaNameFromCoords = async (
  latitude: number,
  longitude: number
): Promise<{ areaName: string; city: string; fullAddress: string }> => {
  const cacheKey = `geo_cache_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.areaName) return parsed;
    }
  } catch (e) {}

  // 1. Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: { 'User-Agent': 'NearbyAppGeocodingService/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.county ||
        '';
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.state_district ||
        addr.county ||
        '';

      let shortName = '';
      if (area && city && area.toLowerCase() !== city.toLowerCase()) {
        shortName = `${area}, ${city}`;
      } else if (area) {
        shortName = area;
      } else if (city) {
        shortName = city;
      } else if (addr.state) {
        shortName = addr.state;
      }

      if (shortName) {
        const result = {
          areaName: shortName,
          city: city || area,
          fullAddress: data.display_name || shortName
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {}
        return result;
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode failed, trying fallback...', e);
  }

  // 2. Fallback to BigDataCloud Free Client API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const area = data.locality || data.localityInfo?.administrative?.[3]?.name || '';
      const city = data.city || data.principalSubdivision || '';

      let shortName = '';
      if (area && city && area.toLowerCase() !== city.toLowerCase()) {
        shortName = `${area}, ${city}`;
      } else if (area) {
        shortName = area;
      } else if (city) {
        shortName = city;
      }

      if (shortName) {
        const result = {
          areaName: shortName,
          city: city || area,
          fullAddress: `${area}, ${city}, ${data.principalSubdivision || ''}`.trim()
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {}
        return result;
      }
    }
  } catch (e) {
    console.warn('BigDataCloud reverse geocode fallback failed...', e);
  }

  return {
    areaName: '',
    city: '',
    fullAddress: ''
  };
};

export const GOOGLE_MAPS_API_KEY = "AIzaSyBJeVxU3utzjTJYf9hQo-Cd0MVyhTRAlz8";

export interface LocationPredictionItem {
  id: string;
  placeId?: string;
  mainText: string;
  secondaryText: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  isPreResolved?: boolean;
}

// 🚀 Billing Optimizer: Fetch only text predictions while user types (0 geocoding calls)
export const searchLocationPredictions = async (query: string): Promise<LocationPredictionItem[]> => {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const lowerQ = cleanQuery.toLowerCase();

  // 1. Instant 0-cost Local Agra match
  const localMatches: LocationPredictionItem[] = POPULAR_CITIES.filter(
    (c) => c.name.toLowerCase().includes(lowerQ) || c.state.toLowerCase().includes(lowerQ)
  ).map((c) => ({
    id: `local-${c.name}`,
    mainText: c.name,
    secondaryText: c.state,
    fullAddress: `${c.name}, ${c.state}, India`,
    latitude: c.latitude,
    longitude: c.longitude,
    city: 'Agra',
    state: 'Uttar Pradesh',
    isPreResolved: true,
  }));

  // 2. Google Places Autocomplete API with Agra Geographic Priority Bias
  if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
    try {
      const autocompleteService = new (window as any).google.maps.places.AutocompleteService();
      const agraLatLng = new (window as any).google.maps.LatLng(27.1767, 78.0081);

      const predictions: any[] = await new Promise((resolve) => {
        autocompleteService.getPlacePredictions(
          {
            input: cleanQuery,
            componentRestrictions: { country: 'in' },
            location: agraLatLng,
            radius: 40000, // 40km Agra priority circle
            origin: agraLatLng,
          },
          (preds: any[], status: any) => {
            if (status === 'OK' && Array.isArray(preds)) {
              resolve(preds);
            } else {
              resolve([]);
            }
          }
        );
      });

      if (predictions.length > 0) {
        const googleItems: LocationPredictionItem[] = predictions.slice(0, 8).map((p) => ({
          id: p.place_id,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description.split(',')[0],
          secondaryText: p.structured_formatting?.secondary_text || p.description,
          fullAddress: p.description,
          isPreResolved: false,
        }));

        // Combine local Agra matches with Google Places results
        const combined = [...localMatches];
        googleItems.forEach((g) => {
          if (!combined.some((c) => c.mainText.toLowerCase() === g.mainText.toLowerCase())) {
            combined.push(g);
          }
        });

        return combined;
      }
    } catch (e) {
      console.warn('Google Places Autocomplete error, trying fallback...', e);
    }
  }

  // 3. Fallback: Free OpenStreetMap search
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery.includes('agra') ? cleanQuery : `${cleanQuery}, Agra`
    )}&addressdetails=1&limit=8&countrycodes=in`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'NearbyAppGeocodingService/1.0',
        'Accept-Language': 'en,hi',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const osmItems: LocationPredictionItem[] = list.map((item: any) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Agra';
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
          const mainName = item.name || area || city || cleanQuery;
          const secondary = `${area && area !== mainName ? area + ', ' : ''}${city}`;

          return {
            id: `osm-${item.place_id || item.osm_id}`,
            mainText: mainName,
            secondaryText: secondary || 'Uttar Pradesh',
            fullAddress: item.display_name || `${mainName}, ${city}, India`,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city: city || 'Agra',
            state: addr.state || 'Uttar Pradesh',
            isPreResolved: true,
          };
        });

        const combined = [...localMatches];
        osmItems.forEach((o) => {
          if (!combined.some((c) => c.mainText.toLowerCase() === o.mainText.toLowerCase())) {
            combined.push(o);
          }
        });

        return combined;
      }
    }
  } catch (err) {}

  return localMatches;
};

// 🎯 Billing Optimizer: Geocode ONLY the single place that the user clicks on (with localStorage caching)
export const resolveLocationCoordinates = async (
  item: LocationPredictionItem
): Promise<LocationCoords> => {
  // 1. If coordinates are already known (e.g. from local Agra list or OSM)
  if (item.isPreResolved && item.latitude && item.longitude) {
    return {
      latitude: item.latitude,
      longitude: item.longitude,
      areaName: `${item.mainText}, ${item.city || 'Agra'}`,
      city: item.city || 'Agra',
      state: item.state || 'Uttar Pradesh',
      fullAddress: item.fullAddress,
      isManual: true,
    };
  }

  // 2. Check local place cache to avoid duplicate Google billing
  if (item.placeId) {
    const cacheKey = `gplace_cache_${item.placeId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.latitude && parsed?.longitude) {
          return { ...parsed, isManual: true };
        }
      }
    } catch (e) {}

    // 3. Resolve via Google Geocoder (Only 1 call per user click)
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const resCoords: LocationCoords | null = await new Promise((resolve) => {
          geocoder.geocode({ placeId: item.placeId }, (results: any[], status: any) => {
            if (status === 'OK' && results && results[0]) {
              const g = results[0];
              const lat = g.geometry.location.lat();
              const lng = g.geometry.location.lng();

              let city = '';
              let state = '';
              let sublocality = '';
              let locality = '';

              if (Array.isArray(g.address_components)) {
                g.address_components.forEach((c: any) => {
                  if (c.types.includes('locality')) city = c.long_name;
                  if (!city && c.types.includes('administrative_area_level_2')) city = c.long_name;
                  if (c.types.includes('administrative_area_level_1')) state = c.long_name;
                  if (c.types.includes('sublocality_level_1')) sublocality = c.long_name;
                  if (c.types.includes('sublocality') && !sublocality) sublocality = c.long_name;
                  if (c.types.includes('neighborhood') && !locality) locality = c.long_name;
                });
              }

              const mainName = item.mainText || sublocality || locality || city || g.formatted_address.split(',')[0];
              const areaLabel = city && mainName.toLowerCase() !== city.toLowerCase()
                ? `${mainName}, ${city}`
                : mainName;

              const locResult: LocationCoords = {
                latitude: lat,
                longitude: lng,
                areaName: areaLabel,
                city: city || 'Agra',
                state: state || 'Uttar Pradesh',
                fullAddress: g.formatted_address || item.fullAddress,
                isManual: true,
              };

              try {
                localStorage.setItem(cacheKey, JSON.stringify(locResult));
              } catch (err) {}

              resolve(locResult);
            } else {
              resolve(null);
            }
          });
        });

        if (resCoords) return resCoords;
      } catch (err) {
        console.warn('Google Geocoder placeId lookup error:', err);
      }
    }
  }

  // Fallback default coordinates (Agra)
  return {
    latitude: item.latitude || 27.1767,
    longitude: item.longitude || 78.0081,
    areaName: item.mainText ? `${item.mainText}, Agra` : 'Agra, UP',
    city: item.city || 'Agra',
    state: item.state || 'Uttar Pradesh',
    fullAddress: item.fullAddress || 'Agra, Uttar Pradesh, India',
    isManual: true,
  };
};

export const searchLocations = async (query: string): Promise<SearchLocationResult[]> => {
  const items = await searchLocationPredictions(query);
  return items.map((i) => ({
    latitude: i.latitude || 27.1767,
    longitude: i.longitude || 78.0081,
    areaName: `${i.mainText}, ${i.secondaryText.split(',')[0].trim()}`,
    city: i.city || 'Agra',
    state: i.state || 'Uttar Pradesh',
    fullAddress: i.fullAddress,
    type: i.isPreResolved ? 'locality' : 'google_place',
  }));
};

export const getCurrentUserLocation = async (): Promise<LocationCoords> => {
  let coords: { latitude: number; longitude: number; accuracy?: number };

  try {
    const permStatus = await checkLocationPermission();
    if (permStatus.location !== 'granted') {
      const requestRes = await requestLocationPermission();
      if (requestRes.location !== 'granted') {
        throw new Error('LOCATION_PERMISSION_DENIED');
      }
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000
    });

    coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  } catch (err: any) {
    console.error('Error getting native location, trying browser fallback:', err);
    coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (geoErr) => reject(new Error(geoErr.message || 'LOCATION_DISABLED')),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        reject(new Error('LOCATION_NOT_SUPPORTED'));
      }
    });
  }

  // Resolve Area Name asynchronously / with cache
  const geoInfo = await getAreaNameFromCoords(coords.latitude, coords.longitude);

  return {
    ...coords,
    areaName: geoInfo.areaName || undefined,
    city: geoInfo.city || undefined,
    fullAddress: geoInfo.fullAddress || undefined,
    isManual: false
  };
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  const info = await getAreaNameFromCoords(latitude, longitude);
  return info.fullAddress || info.areaName || '';
};
