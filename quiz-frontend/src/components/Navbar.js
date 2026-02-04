import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
    const { lang, setLang, t } = useLang();
    const [query, setQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const isLocal = window.location.hostname === "localhost";

    const DJANGO_BASE = (
        process.env.REACT_APP_DJANGO_PUBLIC_URL ||
        (isLocal ? "http://localhost:8000" : "")
    ).replace(/\/$/, "");

    const API_BASE = (
        process.env.REACT_APP_API_URL ||
        (isLocal ? "http://localhost:8000/api" : "")
    ).replace(/\/$/, "");

    return (
        <header id="header" className="kl-header">
            <div className="kl-header-inner">
                <nav className="navigation navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid">
                        <div className="row align-items-center w-100" style={{ margin: 0 }}>

                            {/* Logo */}
                            <div className="col-6 col-md-3 p-0">
                                <div className="navbar-header d-flex align-items-center">
                                    <a className="navbar-brand d-flex align-items-center gap-2 m-0" href={`${ DJANGO_BASE }/?lang=${ lang }`}>
                                        {/* ✅ public/ image */}
                                        <img
                                            src="/Learning.png"
                                            alt="Kidslearning"
                                            className="kl-logo"
                                        />
                                        <span className="kl-logo-text">Kidslearning</span>
                                    </a>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="col-md-6 d-none d-md-flex justify-content-center p-0">
                                <ul className="navbar-nav kl-nav-links d-flex flex-row m-0 p-0">
                                    <li className="nav-item"><a className="nav-link" href={`${ DJANGO_BASE }/?lang=${ lang }`}>{t.home}</a></li>
                                    <li className="nav-item"><a className="nav-link" href={`${ DJANGO_BASE }/about/?lang=${ lang }`}>{t.about}</a></li>
                                    <li className="nav-item"><a className="nav-link" href={`${ DJANGO_BASE }/lessons/?lang=${ lang }`}>{t.lessons}</a></li>
                                    <li className="nav-item"><Link className="nav-link" to="/">{t.games}</Link></li>
                                    <li className="nav-item"><a className="nav-link" href={`${ DJANGO_BASE }/resources/?lang=${ lang }`}>{t.resources}</a></li>
                                    <li className="nav-item"><a className="nav-link" href={`${ DJANGO_BASE }/contact/?lang=${ lang }`}>{t.contact}</a></li>
                                </ul>
                            </div>

                            {/* Right side */}
                            <div className="col-6 col-md-3 d-flex justify-content-end align-items-center kl-right p-0">
                                {!showSearch ? (
                                    <button type="button" className="kl-icon-btn" onClick={() => setShowSearch(true)}>🔍</button>
                                ) : (
                                    <form method="get" action={`${ DJANGO_BASE }/lessons/search/`} className="kl-search-form">
                                        <input
                                            className="form-control"
                                            type="search"
                                            name="q"
                                            placeholder={t.searchPlaceholder}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <input type="hidden" name="lang" value={lang} />
                                        <button className="kl-search-submit" type="submit">{t.go}</button>
                                        <button type="button" className="kl-icon-btn" onClick={() => setShowSearch(false)} aria-label="Close search">✕</button>
                                    </form>
                                )}

                                <div className="kl-lang">
                                    <button type="button" className={`kl-lang-btn ${ lang === "en" ? "active" : "" }`} onClick={() => setLang("en")}>EN</button>
                                    <span className="kl-lang-sep">|</span>
                                    <button type="button" className={`kl-lang-btn ${ lang === "sr" ? "active" : "" }`} onClick={() => setLang("sr")}>SR</button>
                                    <span className="kl-lang-sep">|</span>
                                    <button type="button" className={`kl-lang-btn ${ lang === "de" ? "active" : "" }`} onClick={() => setLang("de")}>DE</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
