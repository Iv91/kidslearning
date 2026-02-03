import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaArrowRight,
    FaVolumeUp,
} from "react-icons/fa";
import "./MatchingGame.css";
import "../components/GiveUpButton.css";
import { safePlay, safeRestart } from "../utils/sound";

function MatchingGame() {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [options, setOptions] = useState([]);
    const [warning, setWarning] = useState("");

    // 🔹 Show intro popup when quiz opens
    const [showIntro, setShowIntro] = useState(() => {
        return localStorage.getItem("fl_skip_intro_matching") ? false : true;
    });

    // ✅ Same API/env logic as before
    const RAW_API = (
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_API_BASE_URL ||
        "http://localhost:8000/api/"
    ).replace(/\/+$/, "");

    const API_BASE = RAW_API.endsWith("/api") ? RAW_API : `${ RAW_API }/api`;
    const SITE_BASE = API_BASE.replace(/\/api$/, "");

    const buildApiUrl = (path) =>
        path.startsWith("http")
            ? path
            : `${ API_BASE }${ path.startsWith("/") ? "" : "/" }${ path }`;

    const absolutize = (maybeRelative) =>
        !maybeRelative
            ? ""
            : maybeRelative.startsWith("http")
                ? maybeRelative
                : `${ SITE_BASE }${ maybeRelative.startsWith("/") ? "" : "/" }${ maybeRelative }`;

    // ✅ Sound effects (use PUBLIC_URL for safety)
    const correctSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/correct.wav`)
    );
    const wrongSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/wrong.wav`)
    );
    const clickSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/click.wav`)
    );

    // 🔊 Finish sounds (different for pass / fail)
    const finishSuccessSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_success.wav`)
    );
    const finishFailSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_fail.wav`)
    );
    const finishPlayed = useRef(false);

    // ✅ Load quiz
    useEffect(() => {
        const QUIZ_URL = buildApiUrl(`/quizzes/${ id }/`);

        fetch(QUIZ_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${ res.status }`);
                return res.json();
            })
            .then((data) => {
                setQuiz(data);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedLetter(null);
                setShowFeedback(false);
                setWarning("");
                finishPlayed.current = false;
            })
            .catch((err) =>
                console.error("❌ Failed to load spelling/matching quiz:", err)
            );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Optional: preload UI sounds
    useEffect(() => {
        [
            correctSound,
            wrongSound,
            clickSound,
            finishSuccessSound,
            finishFailSound,
        ].forEach((ref) => {
            try {
                ref.current.load();
            } catch { }
        });
    }, []);

    // ✅ Prepare options for current question
    useEffect(() => {
        if (!quiz?.matching_items?.length) return;
        if (currentQuestionIndex >= quiz.matching_items.length) return;

        const question = quiz.matching_items[currentQuestionIndex];

        const opts = shuffleArray([
            question.correct_letter,
            question.distractor1 || "X",
            question.distractor2 || "Y",
        ]);

        setOptions(opts);
        setSelectedLetter(null);
        setShowFeedback(false);
        setWarning("");
    }, [quiz, currentQuestionIndex]);

    // 🔊 Play finish sound once when finished (NOT inside render)
    useEffect(() => {
        const total = quiz?.matching_items?.length || 0;
        if (!total) return;

        if (currentQuestionIndex < total) return;
        if (finishPlayed.current) return;

        finishPlayed.current = true;

        const percentage = (score / total) * 100;

        if (percentage >= 50) {
            safeRestart(finishSuccessSound.current);
            safePlay(finishSuccessSound.current);
        } else {
            safeRestart(finishFailSound.current);
            safePlay(finishFailSound.current);
        }
    }, [quiz, currentQuestionIndex, score]);

    // 🔹 Instructions text (EN + SR + DE)
    const getInstructions = () => {
        return (
            <div className="intro-multilang">
                <p>
                    ✏️ <strong>Find the missing letter to complete the word.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Pronađi slovo koje nedostaje da upotpuniš reč.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Finde den fehlenden Buchstaben, um das Wort zu vervollständigen.
                    </span>
                </p>

                <p>
                    👀 <strong>Look at the picture and the word with the blank.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Pogledaj sliku i reč sa praznim mestom.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Sieh dir das Bild und das Wort mit der Lücke an.
                    </span>
                </p>

                <p>
                    🔤 <strong>Choose the letter that correctly completes the word.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Izaberi slovo koje pravilno dopunjuje reč.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Wähle den Buchstaben, der das Wort richtig vervollständigt.
                    </span>
                </p>
            </div>
        );
    };

    if (!quiz || !quiz.matching_items) {
        return <p>Loading quiz...</p>;
    }

    const total = quiz.matching_items.length;

    // ✅ Finished screen
    if (currentQuestionIndex >= total) {
        return (
            <div className="matching-container">
                <h2 className="matching-finished-title">🎉 Quiz Completed!</h2>
                <p className="matching-score-text">
                    Your score: {score} / {total}
                </p>
                <div className="matching-finished-buttons">
                    <a href="http://localhost:8000/">← Back to Main Homepage</a>
                    <a href="/">← Back to Quizzes</a>
                </div>
            </div>
        );
    }

    const question = quiz.matching_items[currentQuestionIndex];

    const handleSelect = (letter) => {
        if (showFeedback || showIntro) return;

        safeRestart(clickSound.current);
        safePlay(clickSound.current);

        setSelectedLetter(letter);
        setWarning("");
    };

    const handleSubmit = () => {
        if (!selectedLetter) {
            setWarning("❗ Please choose a letter first.");
            return;
        }
        setShowFeedback(true);

        if (selectedLetter === question.correct_letter) {
            setScore((prev) => prev + 1);
            safeRestart(correctSound.current);
            safePlay(correctSound.current);
        } else {
            safeRestart(wrongSound.current);
            safePlay(wrongSound.current);
        }
    };

    const handleNext = () => {
        setSelectedLetter(null);
        setShowFeedback(false);
        setWarning("");
        setCurrentQuestionIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="matching-container">
            {/* 🔹 Intro Modal */}
            {showIntro && (
                <div className="intro-modal-backdrop">
                    <div className="intro-modal">
                        <h2>{quiz.title || "Spelling Game"}</h2>
                        <p className="intro-type">Quiz type: Spelling (Missing Letter)</p>

                        {getInstructions()}

                        <div className="intro-skip">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem("fl_skip_intro_matching", "yes");
                                        } else {
                                            localStorage.removeItem("fl_skip_intro_matching");
                                        }
                                    }}
                                />
                                Don’t show instructions next time
                            </label>
                        </div>

                        <div className="intro-buttons">
                            <button
                                type="button"
                                className="intro-start-btn"
                                onClick={() => setShowIntro(false)}
                            >
                                Start Spelling! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="matching-title">{quiz.title}</h2>

            {/* 🧩 2-column layout wrapper */}
            <div className="matching-inner">
                <div className="matching-left">
                    {question.image_url && (
                        <img
                            src={absolutize(question.image_url)}
                            alt="quiz"
                            className="matching-image"
                        />
                    )}
                </div>

                <div className="matching-right">
                    <p className="matching-word">
                        Word: <span>{question.masked_word}</span>
                    </p>

                    <div className="matching-options">
                        {options.map((letter, index) => {
                            let classes = "matching-letter-btn";
                            if (!showFeedback && selectedLetter === letter) classes += " selected";
                            if (showFeedback) {
                                if (letter === question.correct_letter) classes += " correct";
                                else if (letter === selectedLetter) classes += " wrong";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(letter)}
                                    disabled={showFeedback || showIntro}
                                    className={classes}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>

                    {warning && <p className="matching-warning">{warning}</p>}

                    {!showFeedback ? (
                        <>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedLetter || showIntro}
                                className="matching-submit"
                            >
                                <FaVolumeUp style={{ marginRight: "6px" }} />
                                Submit
                            </button>

                            <div className="giveup-container">
                                <button
                                    className="giveup-button"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to quit this quiz?")) {
                                            window.location.href = "/";
                                        }
                                    }}
                                >
                                    ← Give Up & Back to Quizzes
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="matching-feedback">
                            {selectedLetter === question.correct_letter ? (
                                <p className="matching-correct">
                                    <FaCheckCircle /> Correct!
                                </p>
                            ) : (
                                <p className="matching-wrong">
                                    <FaTimesCircle /> Wrong! Correct: {question.correct_letter}
                                </p>
                            )}

                            <button onClick={handleNext} className="matching-next-btn">
                                Next <FaArrowRight style={{ marginLeft: "6px" }} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default MatchingGame;


