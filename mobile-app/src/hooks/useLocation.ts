import { useEffect, useState } from 'react';
import { detectLocation, LocationData } from '../services/locationService';

interface UseLocationReturn {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
    isServiceable: boolean;
}

export const useLocation = (): UseLocationReturn => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkLocation = async () => {
            try {
                setLoading(true);
                const locationData = await detectLocation();

                if (!locationData) {
                    setError('Could not detect your location');
                    return;
                }

                setLocation(locationData);

                if (!locationData.isServiceable) {
                    setError(
                        `Service not available in ${locationData.city}. We currently serve Delhi & NCR only.`
                    );
                }
            } catch (err) {
                setError('Error detecting location');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        checkLocation();
    }, []);

    return {
        location,
        loading,
        error,
        isServiceable: location?.isServiceable ?? false,
    };
};
