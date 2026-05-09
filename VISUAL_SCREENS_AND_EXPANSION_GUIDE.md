# 🎨 VISUAL SCREENS - What Users Will See

## Screen 1: 🔄 LOADING SCREEN (While Detecting Location)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│            ⏳ Loading                │
│                                     │
│      Checking your location...      │
│                                     │
│      Verifying service availability │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 2: 🟢 VERIFIED SCREEN (User in Delhi/NCR - Proceed with Form)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    🧑‍💼                                                    │
│                                                         │
│    Complete your profile                               │
│                                                         │
│    We need a few details before checking               │
│    personalized loan options.                          │
│                                                         │
│         📍 Delhi ✓  ← Location Badge (GREEN)           │
│         (Green background = Serviceable)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ FULL NAME                                              │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Enter your full name                        ... │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ DATE OF BIRTH                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Select date                              📅    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ GENDER                                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Select gender                              ▼   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ADDRESS                                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Enter your address                          ... │   │
│ │                                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ PINCODE                                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 6 digit pincode                             ... │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ SAVE PROFILE                            ➔      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen 3: 🔴 BLOCKED SCREEN (User NOT in Delhi/NCR - Show Error)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                   ❌                                    │
│                                                         │
│         Service Not Available                          │
│                                                         │
│  Our service is not available in Mumbai yet.           │
│  We currently serve Delhi & NCR only.                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DETECTED LOCATION                                     │
│  ┌──────────────────────────────────────────────┐     │
│  │ Mumbai, Maharashtra                          │     │
│  │ Latitude: 19.0760                            │     │
│  │ Longitude: 72.8777                           │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │ BACK TO LOGIN                                │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 📝 WHERE TO MAKE CODE CHANGES FOR EXPANSION

## 1️⃣ Add More Cities to Allowed List

**File:** [src/services/locationService.ts](src/services/locationService.ts)

**Current:**
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
];
```

**To expand to Bangalore:**
```typescript
const DELHI_NCR_CITIES = [
  'Delhi',
  'New Delhi',
  'Noida',
  // ... existing cities ...
  'Bangalore',         // ← ADD HERE
  'Bengaluru',         // ← ADD HERE (alternate spelling)
  'Whitefield',        // ← ADD SUBURBS
  'Koramangala',       // ← ADD SUBURBS
];
```

---

## 2️⃣ Change Error Message

**File:** [mobile-app/app/onboarding.tsx](mobile-app/app/onboarding.tsx)

**Find this line (~line 100):**
```typescript
setLocationError(
  `Our service is not available in ${location.city} yet. We currently serve Delhi & NCR only.`
);
```

**Replace with:**
```typescript
setLocationError(
  `Our service is not available in ${location.city} yet. We currently serve Delhi & NCR, and Bangalore.`
);
```

---

## 3️⃣ Customize Location Check Timing

**Option A: Check BEFORE filling form (Current - Recommended)**
```typescript
// In useEffect → detectLocation runs on component mount
useEffect(() => {
  const checkLocationOnLoad = async () => {
    // Checks immediately
  };
}, []);
```

**Option B: Check AFTER filling form**
```typescript
// Move location check to handleSubmit
const handleSubmit = async () => {
  const locationData = await detectLocation();
  if (!locationData?.isServiceable) {
    setError("Service not available in your location");
    return;
  }
  // Continue with save
};
```

**Option C: Check PERIODICALLY (for moving users)**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const location = await detectLocation();
    if (!location?.isServiceable) {
      Alert.alert("You've moved out of service area");
    }
  }, 60000); // Every 60 seconds

  return () => clearInterval(interval);
}, []);
```

---

## 4️⃣ Store Location in User Context (For Global Access)

**File:** [mobile-app/src/context/UserContext.tsx](mobile-app/src/context/UserContext.tsx)

**Add to interface:**
```typescript
interface User {
  // ... existing fields ...
  location?: {
    city: string;
    latitude: number;
    longitude: number;
  };
}
```

**In onboarding.tsx, update handleSubmit:**
```typescript
const handleSubmit = async () => {
  const payload = {
    ...user,
    name: form.name.trim(),
    dob: form.dob.trim(),
    gender: form.gender.trim(),
    address: form.address.trim(),
    pincode: form.pincode.trim(),
    location: {  // ← ADD THIS
      city: userLocation?.city,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
    },
  };
  // ...
};
```

---

## 5️⃣ Send to Backend for Verification

**File:** [mobile-app/src/services/userApi.ts](mobile-app/src/services/userApi.ts)

**Add new function:**
```typescript
export const sendLocationToBackend = async (
  userId: string,
  location: { city: string; latitude: number; longitude: number }
) => {
  return api.post(`/api/user/${userId}/location`, {
    city: location.city,
    coordinates: {
      lat: location.latitude,
      lon: location.longitude,
    },
  });
};
```

**Use in onboarding.tsx:**
```typescript
const handleSubmit = async () => {
  // ... validation ...
  
  // Send location to backend
  await sendLocationToBackend(user._id, {
    city: userLocation!.city,
    latitude: userLocation!.latitude,
    longitude: userLocation!.longitude,
  });
  
  // Then update profile
  const res = await updateProfile(user._id, payload);
  // ...
};
```

---

## 6️⃣ Backend Storage

**File:** [backend/models/User.js](backend/models/User.js)

**Add to schema:**
```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  location: {
    city: String,
    coordinates: {
      lat: Number,
      lon: Number,
    },
    lastVerifiedAt: Date,
  },
});
```

**File:** [backend/routes/userRoutes.js](backend/routes/userRoutes.js)

**Add new endpoint:**
```javascript
router.post('/:id/location', async (req, res) => {
  try {
    const { city, coordinates } = req.body;
    
    // Verify city is in allowed list
    const ALLOWED_CITIES = ['Delhi', 'Noida', 'Gurugram', ...];
    if (!ALLOWED_CITIES.includes(city)) {
      return res.status(403).json({ 
        error: 'Service not available in your location' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'location.city': city,
        'location.coordinates': coordinates,
        'location.lastVerifiedAt': new Date(),
      },
      { new: true }
    );
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 7️⃣ Show Location Badge While Filling Form

**Current Implementation** (already in example):
```typescript
{userLocation && locationStep === "verified" && (
  <View style={{ marginTop: 12, paddingHorizontal: 12, ... }}>
    <MaterialIcons name="location-on" size={14} color="#2E7D32" />
    <Text style={{ color: "#2E7D32", fontSize: 12 }}>
      {userLocation.city} ✓
    </Text>
  </View>
)}
```

**To customize appearance:**
```typescript
// Show flag emoji by city
const getCityEmoji = (city: string) => {
  const emojiMap: Record<string, string> = {
    'Delhi': '🏙️',
    'Noida': '🏢',
    'Gurugram': '💼',
    'Bangalore': '🌴',
  };
  return emojiMap[city] || '📍';
};

// Use it:
<Text>{getCityEmoji(userLocation.city)} {userLocation.city} ✓</Text>
```

---

## 8️⃣ Check Location on Every App Launch (Not Just Onboarding)

**File:** [mobile-app/app/_layout.tsx](mobile-app/app/_layout.tsx)

**Add:**
```typescript
import { useEffect } from 'react';
import { detectLocation } from '../src/services/locationService';

export default function RootLayout() {
  useEffect(() => {
    const checkServiceability = async () => {
      const location = await detectLocation();
      if (location && !location.isServiceable) {
        // User moved out of service area while using app
        console.warn(`Service not available in ${location.city}`);
      }
    };

    checkServiceability();
    const interval = setInterval(checkServiceability, 300000); // Every 5 mins

    return () => clearInterval(interval);
  }, []);

  // ... rest of layout
}
```

---

## 9️⃣ Add Pincode-Based Validation (Backup)

**File:** [src/services/locationService.ts](src/services/locationService.ts)

**Add function:**
```typescript
const ALLOWED_PINCODES = [
  { min: 110001, max: 110097, city: 'Delhi' },
  { min: 201301, max: 201315, city: 'Noida' },
  { min: 122001, max: 122050, city: 'Gurugram' },
];

export const validatePincodeLocation = (pincode: string): boolean => {
  const pincodeNum = parseInt(pincode, 10);
  return ALLOWED_PINCODES.some(
    (range) => pincodeNum >= range.min && pincodeNum <= range.max
  );
};
```

**Use in onboarding:**
```typescript
const handleSubmit = async () => {
  if (!validatePincodeLocation(form.pincode)) {
    setError("We don't service this pincode area");
    return;
  }
  // Continue...
};
```

---

## 🔟 Add Retry Button

**File:** [mobile-app/app/onboarding.tsx](mobile-app/app/onboarding.tsx)

**In error screen:**
```typescript
if (locationStep === "failed") {
  return (
    <View>
      {/* ... error UI ... */}
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => {
            setLocationStep(null);
            setLocationError(null);
            // Re-trigger location check
            // manually call the useEffect logic
          }}
          style={{ flex: 1, backgroundColor: theme.paleBlue, ... }}
        >
          <Text>RETRY</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={{ flex: 1, backgroundColor: theme.primary, ... }}
        >
          <Text>BACK TO LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

# 🎯 SUMMARY: Where to Expand

| Feature | File | Line(s) | Action |
|---------|------|---------|--------|
| **Add Cities** | `locationService.ts` | ~15 | Expand `DELHI_NCR_CITIES` array |
| **Change Message** | `onboarding.tsx` | ~100 | Update error message string |
| **Backend Validation** | `userRoutes.js` | NEW | Add POST `/location` endpoint |
| **Global Access** | `UserContext.tsx` | NEW | Add `location` to User interface |
| **Pincode Validation** | `locationService.ts` | NEW | Add `validatePincodeLocation()` |
| **Periodic Check** | `_layout.tsx` | NEW | Add interval for continuous checking |
| **Location Badge** | `onboarding.tsx` | ~425 | Customize emoji/styling |
| **Retry Logic** | `onboarding.tsx` | ERROR SCREEN | Add retry button |

---

# ✅ Implementation Checklist

- [ ] Install `expo-location`
- [ ] Add permissions to `app.json`
- [ ] Copy 3 files: `locationService.ts`, `useLocation.ts`, `LocationCheckScreen.tsx`
- [ ] Update `onboarding.tsx` with imports and states
- [ ] Add `useEffect` for location check
- [ ] Add conditional screens (loading/verified/failed)
- [ ] Test with mock locations
- [ ] Update `DELHI_NCR_CITIES` with your cities
- [ ] (Optional) Add backend endpoints
- [ ] (Optional) Add to `UserContext`
- [ ] Deploy!

