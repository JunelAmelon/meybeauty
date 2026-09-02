'use client';

import { useState, useTransition, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Globe, ChevronUp } from 'lucide-react';
import Flag from 'react-world-flags';
import { Locale, locales } from '@/i18n/config';
import { setUserLocale } from '@/services/locale';

// Simple cn utility to avoid dependency issues across apps
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

const languageNames: Record<Locale, string> = {
    fr: 'Français',
    en: 'English',
    'es-PE': 'Español'
};

const countryCodes: Record<Locale, string> = {
    fr: 'FR',
    en: 'GB',
    'es-PE': 'PE'
};

export default function LanguageSwitcher() {
    const currentLocale = useLocale() as Locale;
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = () => setIsOpen(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isOpen]);

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) {
            setIsOpen(false);
            return;
        }

        startTransition(async () => {
            await setUserLocale(newLocale);
            setIsOpen(false);
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]" onClick={(e) => e.stopPropagation()}>
            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 mb-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-emerald-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-emerald-800/50 uppercase tracking-widest border-b border-emerald-50 mb-1">
                            Sélectionner la langue
                        </div>
                        {locales.map((locale) => (
                            <button
                                key={locale}
                                onClick={() => handleLocaleChange(locale)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-emerald-50 text-slate-600",
                                    currentLocale === locale && "bg-emerald-50/80 text-emerald-700 font-semibold"
                                )}
                            >
                                <div className="w-6 h-4 overflow-hidden rounded-sm shadow-sm border border-slate-100">
                                    <Flag code={countryCodes[locale]} className="w-full h-full object-cover" />
                                </div>
                                <span>{languageNames[locale]}</span>
                                {currentLocale === locale && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full shadow-[0_8px_25px_-5px_rgba(35,87,48,0.4)] transition-all duration-500 transform hover:scale-105 active:scale-95 group",
                    "bg-[#523A28] text-white hover:bg-[#1a4224]",
                    isOpen ? "ring-4 ring-emerald-500/20 translate-y-[-4px]" : "",
                    isPending ? "opacity-90 cursor-wait" : ""
                )}
            >
                <div className={cn("transition-transform duration-700", isOpen ? "rotate-[360deg]" : "group-hover:rotate-12")}>
                    <Globe className="w-5 h-5 text-emerald-200/80" />
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-5 h-3.5 overflow-hidden rounded-sm border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <Flag code={countryCodes[currentLocale]} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-50/90">
                        {currentLocale === 'es-PE' ? 'ES' : currentLocale.toUpperCase()}
                    </span>
                </div>

                <ChevronUp className={cn("w-4 h-4 text-emerald-200/50 transition-all duration-500", isOpen ? "rotate-180 opacity-100" : "opacity-0 -translate-y-1")} />
            </button>

            {/* Loading Pulse */}
            {isPending && (
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/30 -z-10" />
            )}
        </div>
    );
}
