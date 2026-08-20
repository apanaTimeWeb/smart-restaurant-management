"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";

export type Language = "en" | "hi";

const TRANSLATIONS = {
  en: {
    readyToServe: "Ready to Serve",
    pending: "Pending",
    cooking: "Preparing",
    placeOrder: "Place Order",
    table: "Table",
    kitchen: "Kitchen",
    waiter: "Waiter",
    search: "Search...",
    newOrder: "New Order",
  },
  hi: {
    readyToServe: "परोसने के लिए तैयार",
    pending: "लंबित",
    cooking: "तैयार हो रहा है",
    placeOrder: "ऑर्डर दें",
    table: "टेबल",
    kitchen: "रसोई",
    waiter: "वेटर",
    search: "खोजें...",
    newOrder: "नया ऑर्डर",
  }
};

export function useLanguage() {
  const [language, setLanguage] = useLocalStorage<Language>("app_language", "en");

  function t(key: keyof typeof TRANSLATIONS.en): string {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key];
  }

  function toggleLanguage() {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  }

  return { language, toggleLanguage, t };
}
