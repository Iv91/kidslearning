import React, { useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
    const { lang, setLang, t } = useLang();
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);

    // Django (Render) base URL (main site)
    const DJANGO_BASE = useMemo(() => {
        return (process.env.REACT_APP_DJANGO_PUBLIC_URL || "http://localhost:8000").replace(/\/+$/, "");
    }, []);

    // React (Vercel) base URL (this app)
    const REACT_BASE = useMemo(() => {
        return (process.env.REACT_APP_PUBLIC_URL || window.location.origin).replace(/\/+$/, "");
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
        window.location.href = `${ DJANGO_BASE }/?q=${ encodeURIComponent(query) }&lang=${ lang }`;
    };

    const changeLang = (newLang) => {
        setLang(newLang);
        setMobileOpen(false);
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

                    {/* IMPORTANT: Games must go to React (Vercel), not Django (/games/ doesn't exist) */}
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
                    {/* Search icon (opens search row below) */}
                    {!showSearch ? (
                        <button
                            className="kl-icon-btn"
                            onClick={() => setShowSearch(true)}
                            aria-label="Search"
                            type="button"
                        >
                            🔍
                        </button>
                    ) : (
                        <button
                            className="kl-icon-btn"
                            onClick={() => {
                                setShowSearch(false);
                                setQuery("");
                            }}
                            aria-label="Close search"
                            type="button"
                        >
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

            {/* SEARCH ROW (responsive) */}
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
                        <button
                            className="kl-search-close"
                            type="button"
                            onClick={() => {
                                setShowSearch(false);
                                setQuery("");
                            }}
                            aria-label="Close search"
                        >
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

                {/* Games -> React */}
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
