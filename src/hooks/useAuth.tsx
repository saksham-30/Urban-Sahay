import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, AuthUser } from '@/lib/api';
import { toast } from 'sonner';

type AppRole = 'user' | 'service_provider';

interface AuthContextType {
  user: AuthUser | null;
  session: null;
  userRole: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: AppRole, profileData: UserProfileData | ServiceProviderProfileData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

interface UserProfileData {
  full_name: string;
  phone?: string;
}

interface ServiceProviderProfileData {
  full_name: string;
  service_type: string;
  city: string;
  phone: string;
  description?: string;
  experience_years?: number;
  hourly_rate?: string;
}

const TOKEN_KEY = 'urban_sahay_token';
const USER_KEY = 'urban_sahay_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const parsed: AuthUser = JSON.parse(stored);
        setUser(parsed);
        setUserRole(parsed.role);
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: AppRole,
    profileData: UserProfileData | ServiceProviderProfileData
  ) => {
    try {
      const body: Record<string, unknown> = {
        email,
        password,
        role,
        fullName: profileData.full_name,
        phone: profileData.phone,
      };

      if (role === 'service_provider') {
        const spData = profileData as ServiceProviderProfileData;
        body.serviceType = spData.service_type;
        body.city = spData.city;
        body.description = spData.description;
        body.experienceYears = spData.experience_years;
        body.hourlyRate = spData.hourly_rate;
      }

      const { token, user: authUser } = await api.register(body);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      setUserRole(authUser.role);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: authUser } = await api.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      setUserRole(authUser.role);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setUserRole(null);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, session: null, userRole, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};