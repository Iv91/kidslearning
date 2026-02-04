import React, { useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
    const { lang, setLang } = useLang();
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);

    const DJANGO_BASE = useMemo(() => {
        return (process.env.REACT_APP_DJANGO_PUBLIC_URL || "http://localhost:8000").replace(/\/+$/, "");
    }, []);

    const goTo = (path) => {
        setMobileOpen(false);
        window.location.href = `${ DJANGO_BASE }${ path }`;
    };

    const submitSearch = (e) => {
        e.preventDefault();
        setMobileOpen(false);
        window.location.href = `${ DJANGO_BASE }/?q=${ encodeURIComponent(query) }&lang=${ lang }`;
    };

    return (
        <header className="kl-header">
            <div className="kl-header-inner">

                {/* LEFT */}
                <div className="kl-left">
                    <button className="kl-logo-btn" onClick={() => goTo(`/?lang=${ lang }`)} aria-label="Go home">
                        <img src="/Learning.png" alt="KidsLearning" className="kl-logo" />
                    </button>
                </div>

                {/* CENTER (desktop) */}
                <nav className="kl-nav" aria-label="Main">
                    <button className="kl-nav-link" onClick={() => goTo(`/?lang=${ lang }`)}>Home</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/about/?lang=${ lang }`)}>About</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/lessons/?lang=${ lang }`)}>Lessons</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/games/?lang=${ lang }`)}>Games</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/resources/?lang=${ lang }`)}>Resources</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/contact/?lang=${ lang }`)}>Contact</button>
                </nav>

                {/* RIGHT */}
                <div className="kl-right">

                    {/* Search */}
                    {!showSearch ? (
                        <button className="kl-icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">🔍</button>
                    ) : (
                        <form className="kl-search-form" onSubmit={submitSearch}>
                            <input
                                className="kl-search-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                            />
                            <button className="kl-search-submit" type="submit">Go</button>
                            <button
                                className="kl-search-close"
                                type="button"
                                onClick={() => { setShowSearch(false); setQuery(""); }}
                                aria-label="Close search"
                            >
                                ✕
                            </button>
                        </form>
                    )}

                    {/* Language */}
                    <div className="kl-lang">
                        <button className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`} onClick={() => setLang("en")} type="button">EN</button>
                        <span className="kl-lang-sep">|</span>
                        <button className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`} onClick={() => setLang("sr")} type="button">SR</button>
                        <span className="kl-lang-sep">|</span>
                        <button className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`} onClick={() => setLang("de")} type="button">DE</button>
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

            {/* MOBILE MENU PANEL */}
            <div className={`kl-mobile-panel ${ mobileOpen ? "open" : "" }`}>
                <button className="kl-mobile-link" onClick={() => goTo(`/?lang=${ lang }`)}>Home</button>
                <button className="kl-mobile-link" onClick={() => goTo(`/about/?lang=${ lang }`)}>About</button>
                <button className="kl-mobile-link" onClick={() => goTo(`/lessons/?lang=${ lang }`)}>Lessons</button>
                <button className="kl-mobile-link" onClick={() => goTo(`/games/?lang=${ lang }`)}>Games</button>
                <button className="kl-mobile-link" onClick={() => goTo(`/resources/?lang=${ lang }`)}>Resources</button>
                <button className="kl-mobile-link" onClick={() => goTo(`/contact/?lang=${ lang }`)}>Contact</button>
                <div className="kl-mobile-divider"></div>

                <div className="kl-mobile-lang">
                    <button className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`} onClick={() => setLang("en")} type="button">EN</button>
                    <button className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`} onClick={() => setLang("sr")} type="button">SR</button>
                    <button className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`} onClick={() => setLang("de")} type="button">DE</button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
