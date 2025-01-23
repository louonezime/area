// // this will probably be chnaged w i18n routing by 6 Oct 2024

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import enTranslations from "../locales/en.json";
// import frTranslations from "../locales/fr.json";

// const TranslationsContext = createContext<any>(null);

// interface TranslationsHandlerProps {
//   children: ReactNode;
// }

// export const TranslationsHandler: React.FC<TranslationsHandlerProps> = ({
//   children,
// }) => {
//   const [language, setLanguage] = useState<string>(
//     localStorage.getItem("language") || "en",
//   );
//   const [translations, setTranslations] = useState<any>(enTranslations);

//   useEffect(() => {
//     if (language === "fr") {
//       setTranslations(frTranslations);
//     } else {
//       setTranslations(enTranslations);
//     }

//     localStorage.setItem("language", language);
//   }, [language]);

//   return (
//     <TranslationsContext.Provider
//       value={{ language, setLanguage, translations }}
//     >
//       {children}
//     </TranslationsContext.Provider>
//   );
// };

// export const useTranslations = () => {
//   return useContext(TranslationsContext);
// };
