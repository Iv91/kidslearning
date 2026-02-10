import React, { useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
    const { lang, setLang, t } = useLang();
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);


    const DJANGO_BASE = useMemo(() => {
        return (process.env.REACT_APP_DJANGO_PUBLIC_URL || "http://localhost:8000").replace(/\/+$/, "");
    }, []);


    const REACT_BASE = useMemo(() => {
        return window.location.origin.replace(/\/+$/, "");
    }, []);

    const goToDjango = (path) => {
        setMobileOpen(false);
        setShowSearch(false);
        window.location.href = `${ DJANGO_BASE }${ path }`;
    };

    const goToReact = (path = "/") => {
        setMobileOpen(false);
        setShowSearch(false);
        const hasQuery = path.includes("?");
        window.location.href = `${ REACT_BASE }${ path }${ hasQuery ? "&" : "?" }lang=${ lang }`;
    };


    const submitSearch = (e) => {
        e.preventDefault();
        setMobileOpen(false);
        setShowSearch(false);

        const q = query.trim();
        if (!q) return;


        window.location.href = `${ DJANGO_BASE }/lessons/search/?q=${ encodeURIComponent(q) }&lang=${ lang }`;
    };

    const changeLang = (newLang) => {
        setLang(newLang);
        setMobileOpen(false);
    };

    const openSearch = () => {
        setShowSearch(true);
        setMobileOpen(false);
    };

    const closeSearch = () => {
        setShowSearch(false);
        setQuery("");
    };

    return (
        <header className="kl-header">
            <div className="kl-header-inner">
                {/* LEFT */}
                <div className="kl-left">
                    <button
                        className="kl-logo-btn"
                        onClick={() => goToDjango(`/?lang=${ lang }`)}
                        aria-label="Go home"
                        type="button"
                    >
                        <img src="/Learning.png" alt="KidsLearning" className="kl-logo" />
                    </button>
                </div>

                {/* CENTER (desktop) */}
                <nav className="kl-nav" aria-label="Main">
                    <button className="kl-nav-link" onClick={() => goToDjango(`/?lang=${ lang }`)}>
                        {t.home}
                    </button>
                    <button className="kl-nav-link" onClick={() => goToDjango(`/about/?lang=${ lang }`)}>
                        {t.about}
                    </button>
                    <button className="kl-nav-link" onClick={() => goToDjango(`/lessons/?lang=${ lang }`)}>
                        {t.lessons}
                    </button>

                    {/* Games must go to React */}
                    <button className="kl-nav-link" onClick={() => goToReact("/")}>
                        {t.games}
                    </button>

                    <button className="kl-nav-link" onClick={() => goToDjango(`/resources/?lang=${ lang }`)}>
                        {t.resources}
                    </button>
                    <button className="kl-nav-link" onClick={() => goToDjango(`/contact/?lang=${ lang }`)}>
                        {t.contact}
                    </button>
                </nav>

                {/* RIGHT */}
                <div className="kl-right">
                    {/* Search icon */}
                    {!showSearch ? (
                        <button className="kl-icon-btn" onClick={openSearch} aria-label="Search" type="button">
                            🔍
                        </button>
                    ) : (
                        <button className="kl-icon-btn" onClick={closeSearch} aria-label="Close search" type="button">
                            ✕
                        </button>
                    )}

                    {/* Language (desktop) - CSS hides on mobile */}
                    <div className="kl-lang">
                        <button
                            className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`}
                            onClick={() => changeLang("en")}
                            type="button"
                        >
                            EN
                        </button>
                        <span className="kl-lang-sep">|</span>
                        <button
                            className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`}
                            onClick={() => changeLang("sr")}
                            type="button"
                        >
                            SR
                        </button>
                        <span className="kl-lang-sep">|</span>
                        <button
                            className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`}
                            onClick={() => changeLang("de")}
                            type="button"
                        >
                            DE
                        </button>
                    </div>

                    {/* Burger (mobile) */}
                    <button
                        className="kl-burger"
                        type="button"
                        aria-label="Menu"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* SEARCH ROW */}
            {showSearch && (
                <div className="kl-search-row">
                    <form className="kl-search-form" onSubmit={submitSearch}>
                        <input
                            className="kl-search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                        />
                        <button className="kl-search-submit" type="submit">
                            {t.go}
                        </button>
                        <button className="kl-search-close" type="button" onClick={closeSearch} aria-label="Close search">
                            ✕
                        </button>
                    </form>
                </div>
            )}

            {/* MOBILE MENU PANEL */}
            <div className={`kl-mobile-panel ${ mobileOpen ? "open" : "" }`}>
                <button className="kl-mobile-link" onClick={() => goToDjango(`/?lang=${ lang }`)}>
                    {t.home}
                </button>
                <button className="kl-mobile-link" onClick={() => goToDjango(`/about/?lang=${ lang }`)}>
                    {t.about}
                </button>
                <button className="kl-mobile-link" onClick={() => goToDjango(`/lessons/?lang=${ lang }`)}>
                    {t.lessons}
                </button>

                <button className="kl-mobile-link" onClick={() => goToReact("/")}>
                    {t.games}
                </button>

                <button className="kl-mobile-link" onClick={() => goToDjango(`/resources/?lang=${ lang }`)}>
                    {t.resources}
                </button>
                <button className="kl-mobile-link" onClick={() => goToDjango(`/contact/?lang=${ lang }`)}>
                    {t.contact}
                </button>

                <div className="kl-mobile-divider"></div>

                {/* Languages inside burger */}
                <div className="kl-mobile-lang">
                    <button
                        className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`}
                        onClick={() => changeLang("en")}
                        type="button"
                    >
                        EN
                    </button>
                    <button
                        className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`}
                        onClick={() => changeLang("sr")}
                        type="button"
                    >
                        SR
                    </button>
                    <button
                        className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`}
                        onClick={() => changeLang("de")}
                        type="button"
                    >
                        DE
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;

