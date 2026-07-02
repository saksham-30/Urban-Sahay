import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { defaultLanguage, isSupportedLanguage, languageLabels, supportedLanguages, translations, type Language } from '@/lib/translations';
import { useAuth } from '@/hooks/useAuth';

const LANGUAGE_KEY = 'urban_sahay_language';

interface LanguageContextType {
  language: Language;
  languageLabel: string;
  supportedLanguages: typeof supportedLanguages;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return defaultLanguage;
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return isSupportedLanguage(stored) ? stored : defaultLanguage;
};

const applyDocumentLanguage = (language: Language) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user, userRole, isLoading } = useAuth();
  const [language, setLanguageState] = useState<Language>(getStoredLanguage());

  useEffect(() => {
    applyDocumentLanguage(language);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLanguageState(getStoredLanguage());
      return;
    }

    const syncLanguage = async () => {
      try {
        const profile = userRole === 'service_provider' ? await api.getProviderProfile() : await api.getProfile();
        if (profile?.language && isSupportedLanguage(profile.language)) {
          setLanguageState(profile.language);
        }
      } catch {
        // Keep the locally stored language if profile lookup fails.
      }
    };

    void syncLanguage();
  }, [isLoading, user, userRole]);

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);

    if (!user) return;

    try {
      if (userRole === 'service_provider') {
        await api.updateProviderProfile({ language: nextLanguage });
      } else {
        await api.updateProfile({ language: nextLanguage });
      }
    } catch {
      // Local preference still updates even if persistence fails.
    }
  };

  const t = useMemo(
    () => (key: string, fallback?: string) => translations[language][key] ?? translations[defaultLanguage][key] ?? fallback ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageLabel: languageLabels[language],
        supportedLanguages,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
