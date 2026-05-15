import { useState, useEffect } from 'react';

const CACHE_KEY = 'user_location_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface LocationCache {
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<string>("Detecting...");
  const [address, setAddress] = useState<any>(null);
  const [state, setState] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check Cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: LocationCache = JSON.parse(cached);
          const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY;
          
          // CRITICAL: Ensure we have valid coordinates in the cache
          const hasCoords = typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number';

          if (!isExpired && hasCoords) {
            setLocation(parsed.city);
            setState(parsed.state || "");
            setLatitude(parsed.latitude);
            setLongitude(parsed.longitude);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(CACHE_KEY);
          }
        } catch (parseError) {
          console.error("Failed to parse location cache", parseError);
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (e) {
      console.warn("Failed to read location cache", e);
    }

    // 2. Fallback to geolocation
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // 3. Reverse Geocoding via BigDataCloud (more accurate for administrative boundaries)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          
          // BigDataCloud provides 'locality' (e.g. Ibadan) and 'city' (e.g. Akinyele)
          // 'principalSubdivision' is the State (e.g. Oyo)
          const city = data.locality || data.city || data.principalSubdivision || "Unknown Location";
          const userState = data.principalSubdivision || "";
          
          setLocation(city);
          setAddress(data);
          setState(userState);
          setLatitude(latitude);
          setLongitude(longitude);
          
          // Update cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            city,
            state: userState,
            latitude,
            longitude,
            timestamp: Date.now()
          }));
          
        } catch (err) {
          console.error("Error fetching location data:", err);
          setLocation("Location unavailable");
          setError("Failed to resolve location name");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        
        // Handle specific error codes if desired
        if (geoError.code === geoError.PERMISSION_DENIED) {
            setLocation("Nigeria"); // Fallback
        } else {
            setLocation("Location unavailable");
        }
        
        setError(geoError.message);
        setLoading(false);
      },
      {
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Listen for manual location overrides
  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: LocationCache = JSON.parse(cached);
          setLocation(parsed.city);
          setState(parsed.state || "");
          setLatitude(parsed.latitude);
          setLongitude(parsed.longitude);
        }
      } catch (e) {
        console.error("Failed to sync location change", e);
      }
    };

    window.addEventListener('location:changed' as any, handleLocationChange);
    return () => window.removeEventListener('location:changed' as any, handleLocationChange);
  }, []);

  return { location, address, state, latitude, longitude, loading, error };
}
