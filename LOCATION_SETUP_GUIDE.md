# Location Detection Setup Guide - Delhi & NCR

## What's Been Created

1. **locationService.ts** - Core location detection service with:
   - GPS-based detection using Expo Location API (free)
   - Reverse geocoding via OpenStreetMap Nominatim (free)
   - IP-based fallback detection (free)

2. **useLocation.ts** - React hook for easy integration

3. **LocationCheckScreen.tsx** - Example UI component

---

## Installation Steps

### Step 1: Install Expo Location (If not already installed)
```bash
cd mobile-app
expo install expo-location
```

### Step 2: Add Permissions to app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermissions": "Allow LoanSaarthi to access your location"
        }
      ]
    ]
  }
}
```

---

## Integration Options

### Option A: Add Location Check During Onboarding (Recommended)

In your **onboarding.tsx**:

```typescript
import { LocationCheckScreen } from '../src/components/LocationCheckScreen';
import { useEffect, useState } from 'react';

export default function OnboardingScreen() {
  const [locationVerified, setLocationVerified] = useState(false);

  if (!locationVerified) {
    return (
      <LocationCheckScreen 
        onLocationVerified={() => setLocationVerified(true)} 
      />
    );
  }

  // Rest of your onboarding screen
  return (
    // ... your existing onboarding UI
  );
}
```

### Option B: Add Location Check During Login

In your **login.tsx**:

```typescript
import { useLocation } from '../src/hooks/useLocation';

export default function LoginScreen() {
  const { location, loading, error, isServiceable } = useLocation();

  const handleLogin = async () => {
    if (!isServiceable) {
      Alert.alert('Service Not Available', error);
      return;
    }

    // Proceed with login
    // ...also send location to backend:
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        // ... your login data
        location: {
          city: location?.city,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      }),
    });
  };

  // ... rest of your login UI
}
```

### Option C: Check Location on App Startup

In your **_layout.tsx** (root layout):

```typescript
import { useLocation } from '../src/hooks/useLocation';

export default function RootLayout() {
  const { isServiceable, error } = useLocation();

  useEffect(() => {
    if (error && !isServiceable) {
      // Show location warning
      Alert.alert('Service Not Available', error);
    }
  }, [error, isServiceable]);

  // ... rest of your layout
}
```

---

## Customization

### Modify Delhi NCR Cities List

Edit [src/services/locationService.ts](src/services/locationService.ts) to add/remove cities:

```typescript
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
  // Add more cities here
];
```

### Store Location in User Context

Add to your **UserContext.tsx**:

```typescript
interface UserContextType {
  // ... existing fields
  userLocation: LocationData | null;
  setUserLocation: (location: LocationData) => void;
}

// In your context provider:
const [userLocation, setUserLocation] = useState<LocationData | null>(null);

useEffect(() => {
  detectLocation().then(setUserLocation);
}, []);
```

---

## Backend Integration

### Send Location to Server (Optional)

Add to your **api.ts**:

```typescript
export const logUserLocation = async (location: LocationData) => {
  return fetch(`${API_BASE_URL}/api/user/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  });
};
```

---

## Cost Breakdown

| Service | Cost | Included |
|---------|------|----------|
| Expo Location API | FREE | GPS location ✓ |
| OpenStreetMap Nominatim | FREE | Reverse geocoding ✓ |
| IP-API.com | FREE (45 req/min) | Fallback location ✓ |
| **Total Monthly Cost** | **₹0** | - |

---

## Comparison with Paid Solutions

| Service | Cost | Accuracy |
|---------|------|----------|
| Your Solution | Free | GPS: 5-20m, IP: City-level |
| Google Maps API | $0.005-0.07/req | GPS: 5m |
| Mapbox | $0.50/1000 req | GPS: 5m |
| AWS Location Service | $0.005-0.30/req | GPS: 5m |

✅ **Your solution is perfect for this use case!**

---

## Testing

### Test on Emulator
```bash
# iOS: Set location in Simulator
# Settings > Privacy > Location > Enable mock location

# Android: Set location in Emulator
# Settings > Location > Use mock location
```

### Test Different Cities
- Set mock location to: Delhi (28.6139° N, 77.2090° E)
- Set mock location to: Mumbai (19.0760° N, 72.8777° E) - Should fail ✓
- Set mock location to: Noida (28.5355° N, 77.3910° E) - Should pass ✓

---

## Troubleshooting

### "Location permission denied"
- Go to App Settings > Permissions > Location > Allow

### "Could not detect location"
- Enable WiFi or mobile data
- Make sure device has GPS/internet
- Check if using emulator with mock location enabled

### "Service not available" appears incorrectly
- Check your city name in the `DELHI_NCR_CITIES` array
- Verify with: https://nominatim.openstreetmap.org/reverse

---

## Next Steps

1. ✅ Install `expo-location` 
2. ✅ Add permissions to `app.json`
3. ✅ Choose integration option (A, B, or C)
4. ✅ Test with mock locations
5. ✅ Deploy and monitor
