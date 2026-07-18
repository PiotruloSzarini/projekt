'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export function UserProvider({ children, userId }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAllUserData = useCallback(async () => {
        if (!userId) {
            setUserData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const profileRes = await fetch('/api/user/profile', {
                cache: 'no-store',
            });

            if (!profileRes.ok) {
                throw new Error(`Błąd API: ${profileRes.status}`);
            }

            const profile = await profileRes.json();
            setUserData(profile);
        } catch (err) {
            console.error('Błąd ładowania danych użytkownika:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAllUserData();
    }, [fetchAllUserData]);

    return (
        <UserContext.Provider value={{ userId, user: userData, loading, refresh: fetchAllUserData }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
