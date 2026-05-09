import * as Location from 'expo-location';

// Delhi NCR boundaries (approximate)
const DELHI_NCR_CITIES = [
    'Delhi',
    'New Delhi',
    'Noida',
    'Gurugram',
    'Gurgaon',
    'Faridabad',
    'Ghaziabad',
    'Greater Noida',
    'Manesar',
    'Bahadurgarh',
];

export interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
    isServiceable: boolean;
}

/**
 * Get device location using GPS
 */
export const getDeviceLocation = async (): Promise<Location.LocationObject | null> => {
    try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.log('Location permission denied');
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return location;
    } catch (error) {
        console.error('Error getting device location:', error);
        return null;
    }
};

/**
 * Reverse geocode coordinates to get city/state using OpenStreetMap Nominatim (FREE)
 */
export const reverseGeocodeLocation = async (
    latitude: number,
    longitude: number
): Promise<LocationData | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    'User-Agent': 'LoanSaarthi-App', // Nominatim requires User-Agent
                },
            }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();

        const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            'Unknown';
        const state = data.address?.state || 'Unknown';
        const country = data.address?.country || 'Unknown';

        const isServiceable = DELHI_NCR_CITIES.some(
            (c) => c.toLowerCase() === city.toLowerCase()
        );

        return {
            latitude,
            longitude,
            city,
            state,
            country,
            isServiceable,
        };
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
};

/**
 * Get complete location info - GPS + Reverse Geocode
 */
export const getCompleteLocationInfo = async (): Promise<LocationData | null> => {
    try {
        const location = await getDeviceLocation();

        if (!location) {
            console.log('Could not get device location');
            return null;
        }

        const locationData = await reverseGeocodeLocation(
            location.coords.latitude,
            location.coords.longitude
        );

        return locationData;
    } catch (error) {
        console.error('Error getting complete location info:', error);
        return null;
    }
};

/**
 * Fallback: Get location based on IP (works without permissions)
 * Free tier: 45 requests/minute
 */
export const getLocationFromIP = async (): Promise<LocationData | null> => {
    try {
        const response = await fetch('https://ip-api.com/json/', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('IP geolocation failed');

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error('IP geolocation API error');
        }

        const city = data.city || 'Unknown';
        const state = data.regionName || 'Unknown';
        const country = data.country || 'Unknown';

        const isServiceable = DELHI_NCR_CITIES.some(
            (c) => c.toLowerCase() === city.toLowerCase()
        );

        return {
            latitude: data.lat || 0,
            longitude: data.lon || 0,
            city,
            state,
            country,
            isServiceable,
        };
    } catch (error) {
        console.error('Error getting location from IP:', error);
        return null;
    }
};

/**
 * Main function: Try GPS first, fallback to IP
 */
export const detectLocation = async (): Promise<LocationData | null> => {
    // Try GPS first (more accurate)
    let locationData = await getCompleteLocationInfo();

    // Fallback to IP-based detection
    if (!locationData) {
        console.log('GPS failed, trying IP-based detection...');
        locationData = await getLocationFromIP();
    }

    return locationData;
};
