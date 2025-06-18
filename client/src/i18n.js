import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import dataEN from "./json/english.json";
import dataAR from "./json/arabic.json";

// Function to set direction dynamically
const setDocumentDirection = (language) => {
  const dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = language; // Set lang attribute for accessibility and SEO
};

// Retrieve saved language from localStorage or default to "en"
const savedLanguage = localStorage.getItem("language") || "en";

// Set initial direction based on saved language
setDocumentDirection(savedLanguage);

const resources = {
  en: {
    translation: dataEN,
  },
  ar: {
    translation: dataAR,
  },
};

i18n
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en", // Default fallback
    interpolation: {
      escapeValue: false, // React handles XSS protection
    },
    debug: false, // Turn on for debugging missing keys
    detection: {
      order: ["localStorage", "navigator"], // Detect language from localStorage or browser settings
      caches: ["localStorage"], // Save detected language in localStorage
    },
  });

// Listen for language changes and update direction and localStorage
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng); // Set RTL/LTR dynamically
  localStorage.setItem("language", lng); // Save selected language
});

export default i18n;
