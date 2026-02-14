import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('ar'); // Default to Arabic

    useEffect(() => {
        const savedLang = Cookies.get('lang');
        if (savedLang) {
            setLang(savedLang);
        }
    }, []);

    const switchLanguage = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        Cookies.set('lang', newLang, { expires: 365 });
    };

    const t = (key) => {
        return translations[lang][key] || key;
    };

    const isRTL = lang === 'ar';

    return (
        <LanguageContext.Provider value={{ lang, switchLanguage, t, isRTL }}>
            <div dir={isRTL ? 'rtl' : 'ltr'} className={lang}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
