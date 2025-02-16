import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    profile_pic: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            console.log("Checking auth...");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
                credentials: 'include'
            });
            console.log("Auth response:", response);
            if (response.ok) {
                const userData = await response.json();
                console.log("User data received:", userData);
                setUser(userData);
            } else {
                console.log("Auth failed with status:", response.status);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const handleRouteChange = () => {
            checkAuth();
        };

        window.addEventListener('popstate', handleRouteChange);
        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}