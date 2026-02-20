import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);

                        // Validate stored user belongs to the current Firebase session
                        // by matching email (safe fallback) or firebaseUid
                        const storedUid = parsedUser.firebaseUid || parsedUser.uid;
                        const emailMatches = parsedUser.email && parsedUser.email === user.email;
                        const uidMatches = storedUid && storedUid === user.uid;

                        if (uidMatches || emailMatches) {
                            setUserRole(parsedUser.role);
                        } else {
                            // Stale data from a different user's session — clear it
                            console.warn('[AuthContext] localStorage user mismatch — clearing stale data');
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            setUserRole(null);
                        }
                    } else {
                        // No stored user yet — login() will set the role when the API call resolves
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error('Error parsing stored user data', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUserRole(null);
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
     * Call this after a successful backend login to set role + localStorage atomically.
     * Prevents the race condition where onAuthStateChanged fires with stale localStorage
     * before the new role is written.
     */
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUserRole(userData.role);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUserRole(null);
        setCurrentUser(null);
        return auth.signOut();
    };

    const value = {
        currentUser,
        userRole,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
