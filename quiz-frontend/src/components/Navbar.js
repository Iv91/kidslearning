import React, { useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
    const { lang, setLang } = useLang();
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");

    // Django base URL (for going back to main site)
    const DJANGO_BASE = useMemo(() => {
        return (process.env.REACT_APP_DJANGO_PUBLIC_URL || "http://localhost:8000").replace(/\/+$/, "");
    }, []);

    const goTo = (path) => {
        window.location.href = `${ DJANGO_BASE }${ path }`;
    };

    const submitSearch = (e) => {
        e.preventDefault();
        // Example: redirect to Django search page (change if your URL differs)
        window.location.href = `${ DJANGO_BASE }/?q=${ encodeURIComponent(query) }&lang=${ lang }`;
    };

    return (
        <header className="kl-header">
            <div className="kl-header-inner">

                {/* LEFT: Logo */}
                <div className="kl-left" onClick={() => goTo(`/?lang=${ lang }`)} role="button" tabIndex={0}>
                    <img src="/Learning.png" alt="KidsLearning" className="kl-logo" />
                </div>

                {/* CENTER: Links (match Django layout) */}
                <nav className="kl-nav" aria-label="Main">
                    <button className="kl-nav-link" onClick={() => goTo(`/?lang=${ lang }`)}>Home</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/about/?lang=${ lang }`)}>About</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/lessons/?lang=${ lang }`)}>Lessons</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/games/?lang=${ lang }`)}>Games</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/resources/?lang=${ lang }`)}>Resources</button>
                    <button className="kl-nav-link" onClick={() => goTo(`/contact/?lang=${ lang }`)}>Contact</button>
                </nav>

                {/* RIGHT: Search + Language */}
                <div className="kl-right">
                    {!showSearch ? (
                        <button className="kl-icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                            🔍
                        </button>
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

                    <div className="kl-lang">
                        <button
                            className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`}
                            onClick={() => setLang("en")}
                            type="button"
                        >
                            EN
                        </button>
                        <span className="kl-lang-sep">|</span>
                        <button
                            className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`}
                            onClick={() => setLang("sr")}
                            type="button"
                        >
                            SR
                        </button>
                        <span className="kl-lang-sep">|</span>
                        <button
                            className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`}
                            onClick={() => setLang("de")}
                            type="button"
                        >
                            DE
                        </button>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default Navbar;
