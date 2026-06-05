import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/userApi";
import { registerUserPushToken } from "../services/notificationService";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
    const [user, setUserState] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 🔥 load user on app start
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            console.log("LOADED USER:", storedUser);
    
            if (storedUser) {
                setUserState(JSON.parse(storedUser));
            }
    
            setLoading(false);
        };
    
        loadUser();
    }, []);

    useEffect(() => {
        let active = true;

        const syncProfileAndPushToken = async () => {
            if (!user?._id) return;

            try {
                const profileRes = await getProfile(user._id);
                if (!active) return;

                const nextUser = profileRes.data;
                setUserState(nextUser);
                await AsyncStorage.setItem("user", JSON.stringify(nextUser));

                const token = await registerUserPushToken(nextUser);
                if (!token || !active) return;

                const refreshedProfileRes = await getProfile(user._id);
                if (!active) return;

                setUserState(refreshedProfileRes.data);
                await AsyncStorage.setItem("user", JSON.stringify(refreshedProfileRes.data));
            } catch (err: any) {
                console.log("USER SYNC ERROR:", err?.message || err);
            }
        };

        syncProfileAndPushToken();

        return () => {
            active = false;
        };
    }, [user?._id]);
    
    //  custom setUser (IMPORTANT)
    const setUser = useCallback(async (data: any) => {
        setUserState(data);
        await AsyncStorage.setItem("user", JSON.stringify(data));
        console.log("USER SAVED:", data);
    }, []);

    const logout = useCallback(async () => {
        setUserState(null);
        await AsyncStorage.removeItem("user");
    }, []);

    const value = useMemo(() => ({ user, setUser, logout, loading }), [user, setUser, logout, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
