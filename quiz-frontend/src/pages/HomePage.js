import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { useLang } from "../i18n/LanguageContext";

function HomePage() {
    const { lang } = useLang();

    const [allQuizzes, setAllQuizzes] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [quizTypes, setQuizTypes] = useState(["All"]);
    const [selectedType, setSelectedType] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const abortRef = useRef(null);

    const API_BASE = useMemo(() => {
        return (
            process.env.REACT_APP_API_URL ||
            process.env.REACT_APP_API_BASE_URL ||
            "https://kidslearning-vhk7.onrender.com/api/"
        ).replace(/\/$/, "");
    }, []);

    const DJANGO_BASE = useMemo(() => {
        return (process.env.REACT_APP_DJANGO_PUBLIC_URL || "http://localhost:8000").replace(
            /\/+$/,
            ""
        );
    }, []);

    // Cache (fast back/refresh)
    const CACHE_KEY = "kidslearning_quizzes_cache_v1";
    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

    const getPaginatedData = (data) => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    };

    const getTotalPages = (data) => Math.max(1, Math.ceil(data.length / pageSize));

    const formatType = (type) =>
        (type || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const getQuizPath = (quiz) => {
        const id = quiz.id;
        switch (quiz.quiz_type) {
            case "drag_drop":
                return `/drag-quiz/${ id }`;
            case "visual":
                return `/visual-quiz/${ id }`;
            case "matching":
                return `/matching-quiz/${ id }`;
            case "pronunciation":
                return `/pronunciation-quiz/${ id }`;
            case "audio":
                return `/audio-quiz/${ id }`;
            default:
                return `/quiz/${ id }`;
        }
    };

    // --- Texts depending on language ---
    const titleText =
        lang === "sr"
            ? "🎮 Dobrodošli u FunlishLand kvizove"
            : lang === "de"
                ? "🎮 Willkommen bei den FunlishLand-Quizzen"
                : "🎮 Welcome to FunlishLand Quizzes";

    const subtitleText =
        lang === "sr"
            ? "Izaberite igru ili kviz i počnite sa učenjem!"
            : lang === "de"
                ? "Wähle ein Spiel oder Quiz und starte mit dem Lernen!"
                : "Select a game or quiz to start learning!";

    const filterLabelText =
        lang === "sr"
            ? "Filtriraj po tipu kviza:"
            : lang === "de"
                ? "Nach Quiz-Typ filtern:"
                : "Filter by quiz type:";

    const playText = lang === "sr" ? "Igraj" : lang === "de" ? "Spielen" : "Play";

    const backButtonText =
        lang === "sr"
            ? "⬅ Nazad na glavni sajt"
            : lang === "de"
                ? "⬅ Zurück zur Hauptseite"
                : "⬅ Back to Main Site";

    const loadingText = lang === "sr" ? "Učitavam kvizove..." : lang === "de" ? "Lade Quizze..." : "Loading quizzes...";
    const retryText = lang === "sr" ? "Pokušaj ponovo" : lang === "de" ? "Erneut versuchen" : "Try again";

    const fetchQuizzes = async () => {
        setError("");

        // 1) Try cache
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed?.ts && Array.isArray(parsed?.data)) {
                    if (Date.now() - parsed.ts < CACHE_TTL_MS) {
                        setAllQuizzes(parsed.data);
                        setQuizzes(parsed.data);
                        setQuizTypes(["All", ...Array.from(new Set(parsed.data.map((q) => q.quiz_type)))]);
                        return; // ✅ instant render from cache
                    }
                }
            }
        } catch {
            // ignore cache parse issues
        }

        // 2) Fetch from API
        setLoading(true);

        // Cancel previous request if any
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const url = `${ API_BASE }/quizzes/`;

            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${ res.status }`);

            const data = await res.json();

            // Your API returns a LIST (not paginated)
            const list = Array.isArray(data) ? data : data.results || [];

            // Cache it
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }));
            } catch {
                // localStorage might be full; ignore
            }

            setAllQuizzes(list);
            setQuizzes(list);
            setQuizTypes(["All", ...Array.from(new Set(list.map((q) => q.quiz_type)))]);
        } catch (err) {
            if (err?.name === "AbortError") return;
            console.error("Failed to load quizzes:", err);
            setError("Failed to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    // initial load
    useEffect(() => {
        fetchQuizzes();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // filter changes
    useEffect(() => {
        const filtered =
            selectedType === "All"
                ? allQuizzes
                : allQuizzes.filter((quiz) => quiz.quiz_type === selectedType);

        setQuizzes(filtered);
        setCurrentPage(1);
    }, [selectedType, allQuizzes]);

    const paginatedQuizzes = getPaginatedData(quizzes);
    const totalPages = getTotalPages(quizzes);

    const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

    return (
        <div className="homepage-container">
            <div className="homepage-inner">
                {/* Back button to Django, keep language */}
                <button
                    className="back-btn"
                    onClick={() => {
                        window.location.href = `${ DJANGO_BASE }/?lang=${ lang }`;
                    }}
                >
                    {backButtonText}
                </button>

                <h1>{titleText}</h1>
                <p className="subtitle">{subtitleText}</p>

                <div className="filter-container">
                    <label htmlFor="type-filter">{filterLabelText}</label>
                    <select
                        id="type-filter"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        {quizTypes.map((type) => (
                            <option key={type} value={type}>
                                {type === "All" ? "All" : formatType(type)}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p>{loadingText}</p>
                ) : error ? (
                    <div style={{ marginTop: "1rem" }}>
                        <p style={{ color: "#b00020" }}>{error}</p>
                        <button className="play-btn" onClick={fetchQuizzes}>
                            {retryText}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="quiz-grid">
                            {paginatedQuizzes.map((quiz) => {
                                const path = getQuizPath(quiz);
                                return (
                                    <div key={quiz.id} className="quiz-card">
                                        {quiz.cover_image && (
                                            <Link to={path}>
                                                <img
                                                    src={quiz.cover_image}
                                                    alt={quiz.title}
                                                    className="quiz-image"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </Link>
                                        )}
                                        <h3>{quiz.title}</h3>
                                        <p>Type: {formatType(quiz.quiz_type)}</p>
                                        <p>Difficulty: {quiz.difficulty}</p>

                                        <Link to={path} className="play-btn">
                                            {playText}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        {quizzes.length > 0 && (
                            <div className="pagination">
                                {currentPage > 1 && <button onClick={handlePrev}>← Previous</button>}
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                {currentPage < totalPages && <button onClick={handleNext}>Next →</button>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default HomePage;
