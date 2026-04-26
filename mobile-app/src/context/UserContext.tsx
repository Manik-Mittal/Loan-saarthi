import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
    const [user, setUserState] = useState(null);
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
    
    //  custom setUser (IMPORTANT)
    const setUser = useCallback(async (data: any) => {
        setUserState(data);
        await AsyncStorage.setItem("user", JSON.stringify(data));
        console.log("USER SAVED:", data);
    }, []);

    const value = useMemo(() => ({ user, setUser, loading }), [user, setUser, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
