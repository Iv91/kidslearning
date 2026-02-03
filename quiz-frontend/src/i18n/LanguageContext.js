import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const SUPPORTED = ["en", "sr", "de"];

const TEXTS = {
    en: {
        home: "Home",
        about: "About",
        lessons: "Lessons",
        games: "Games",
        resources: "Resources",
        contact: "Contact",
        searchPlaceholder: "Search…",
        go: "Go",
        backToKidslearning: "Back to KidsLearning",
        heroTitleA: "Discover, Play & Practice",
        heroTitleB: "English",
        heroDesc:
            "Choose a quiz or game to practice vocabulary, grammar, listening and more – all designed for young learners who love to play.",


        pickGame: "Pick a game to start learning",
        showing: (n) => `Showing ${ n } quiz${ n === 1 ? "" : "zes" } for your child.`,
        filterLabel: "Filter:",
        allGames: "All games",
        playNow: "Play now",
        difficulty: "Difficulty",
        previous: "← Previous",
        next: "Next →",
        pageOf: (p, t) => `Page ${ p } of ${ t }`,

        subscribeTitle: "📩 Subscribe for Updates",
        subscribeBtn: "Subscribe",
        subscribeOk: "✅ Thank you for subscribing!",
        subscribeExists: "⚠️ Already subscribed or invalid email.",
        subscribeFail: "❌ Something went wrong. Try again later.",
    },

    sr: {
        home: "Početna",
        about: "O nama",
        lessons: "Časovi",
        games: "Igre",
        resources: "Radni listovi",
        contact: "Kontakt",
        searchPlaceholder: "Pretraga…",
        go: "Idi",
        backToKidslearning: "Nazad na KidsLearning",
        heroTitleA: "Otkrij, igraj i vežbaj",
        heroTitleB: "engleski",
        heroDesc:
            "Izaberi kviz ili igru za vežbu rečnika, gramatike, slušanja i još mnogo toga — za male učenike koji vole igru.",
        chipAges: "🧒 Uzrast 4–9",
        chipTrack: "⭐ Praćenje napretka",

        pickGame: "Izaberi igru i kreni sa učenjem",
        showing: (n) => `Prikazano ${ n } kviz${ n === 1 ? "" : "a" } za dete.`,
        filterLabel: "Filter:",
        allGames: "Sve igre",
        playNow: "Igraj",
        difficulty: "Težina",
        previous: "← Prethodna",
        next: "Sledeća →",
        pageOf: (p, t) => `Strana ${ p } od ${ t }`,

        subscribeTitle: "📩 Prijavi se za novosti",
        subscribeBtn: "Prijavi se",
        subscribeOk: "✅ Hvala na prijavi!",
        subscribeExists: "⚠️ Već ste prijavljeni ili email nije ispravan.",
        subscribeFail: "❌ Greška. Pokušajte kasnije.",
    },

    de: {
        home: "Start",
        about: "Über uns",
        lessons: "Lektionen",
        games: "Spiele",
        resources: "Arbeitsblätter",
        contact: "Kontakt",
        searchPlaceholder: "Suche…",
        go: "Los",
        backToKidslearning: "Zurück zu KidsLearning",
        heroTitleA: "Entdecken, Spielen & Üben",
        heroTitleB: "Englisch",
        heroDesc:
            "Wähle ein Quiz oder Spiel, um Wortschatz, Grammatik, Hören und mehr zu üben – für junge Lernende, die gerne spielen.",
        chipAges: "🧒 Alter 4–9",
        chipTrack: "⭐ Fortschritt & Punkte",

        pickGame: "Wähle ein Spiel und starte",
        showing: (n) => `Es werden ${ n } Quiz${ n === 1 ? "" : "ze" } angezeigt.`,
        filterLabel: "Filter:",
        allGames: "Alle Spiele",
        playNow: "Spielen",
        difficulty: "Schwierigkeit",
        previous: "← Zurück",
        next: "Weiter →",
        pageOf: (p, t) => `Seite ${ p } von ${ t }`,

        subscribeTitle: "📩 Newsletter abonnieren",
        subscribeBtn: "Abonnieren",
        subscribeOk: "✅ Danke fürs Abonnieren!",
        subscribeExists: "⚠️ Bereits abonniert oder ungültige E-Mail.",
        subscribeFail: "❌ Fehler. Bitte später erneut versuchen.",
    },
};

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    return SUPPORTED.includes(lang) ? lang : null;
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return getLangFromUrl() || localStorage.getItem("kl_lang") || "en";
    });

    useEffect(() => {
        localStorage.setItem("kl_lang", lang);
    }, [lang]);

    // keep URL query param in sync (nice for sharing links)
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.history.replaceState({}, "", url.toString());
    }, [lang]);

    const t = useMemo(() => TEXTS[lang] || TEXTS.en, [lang]);

    const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
    return ctx;
}
