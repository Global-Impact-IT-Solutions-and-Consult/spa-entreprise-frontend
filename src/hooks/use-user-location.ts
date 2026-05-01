import { useState, useEffect } from 'react';

const CACHE_KEY = 'user_location_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface LocationCache {
  city: string;
  timestamp: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<string>("Detecting...");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check Cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: LocationCache = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
          setLocation(parsed.city);
          setLoading(false);
          return;
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
          
          // 3. Reverse Geocoding via Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    'Accept-Language': 'en'
                }
            }
          );
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          const address = data.address;
          
          // Try to get the most relevant city/town name
          const city = address.city || address.town || address.village || address.state || "Unknown Location";
          
          setLocation(city);
          
          // Update cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            city,
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

  return { location, loading, error };
}
