import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./AudioQuizGame.css";
import "../components/GiveUpButton.css";
import { safePlay, safeRestart } from "../utils/sound";

function AudioQuizGame() {
    const { id } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

    // 🔹 Intro popup with "skip next time"
    const [showIntro, setShowIntro] = useState(() => {
        return localStorage.getItem("fl_skip_intro_audio") ? false : true;
    });

    // ✅ Unified API base (matches other games)
    const RAW = (
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_API_BASE_URL ||
        "http://localhost:8000/api/"
    ).replace(/\/+$/, "");

    const API_BASE = RAW.endsWith("/api") ? RAW : `${ RAW }/api`;
    const SITE_BASE = API_BASE.replace(/\/api$/, "");

    const buildApiUrl = (path) =>
        path.startsWith("http")
            ? path
            : `${ API_BASE }${ path.startsWith("/") ? "" : "/" }${ path }`;

    const absolutize = (url) =>
        !url ? "" : url.startsWith("http") ? url : `${ SITE_BASE }${ url.startsWith("/") ? "" : "/" }${ url }`;

    // ✅ Always define questions early (prevents "Cannot access before initialization")
    const questions = useMemo(() => quiz?.audio_questions || [], [quiz]);

    // 🔊 Local UI sound effects (NO click sound in this version)
    const correctSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/correct.wav`));
    const wrongSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/wrong.wav`));
    const finishSuccessSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_success.wav`));
    const finishFailSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_fail.wav`));
    const finishPlayed = useRef(false);

    // 🔊 Option audio (dynamic per option) — reuse one Audio instance
    const optionAudioRef = useRef(new Audio());

    // ✅ Load quiz
    useEffect(() => {
        let isMounted = true;

        fetch(buildApiUrl(`/quizzes/${ id }/`))
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${ res.status }`);
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                setQuiz(data);

                // reset state when opening a new quiz id
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setScore(0);
                setShowFeedback(false);
                finishPlayed.current = false;
            })
            .catch((err) => console.error("❌ Failed to load quiz:", err));

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Optional: preload local sounds (helps on mobile)
    useEffect(() => {
        [correctSound, wrongSound, finishSuccessSound, finishFailSound].forEach((ref) => {
            try {
                ref.current.load();
            } catch { }
        });
    }, []);

    // ✅ Play finish sound ONCE (pass/fail) when finished
    useEffect(() => {
        if (!questions.length) return;
        if (currentQuestionIndex < questions.length) return;
        if (finishPlayed.current) return;

        const percentage = (score / questions.length) * 100;
        finishPlayed.current = true;

        if (percentage >= 50) {
            safeRestart(finishSuccessSound.current);
            safePlay(finishSuccessSound.current);
        } else {
            safeRestart(finishFailSound.current);
            safePlay(finishFailSound.current);
        }
    }, [currentQuestionIndex, questions.length, score]);

    // ✅ Loading states
    if (!quiz) return <p>Loading quiz...</p>;
    if (!questions.length) return <p>No audio questions found for this quiz.</p>;

    // 🔹 Instructions text (EN + SR + DE)
    const getInstructions = () => {
        return (
            <div className="intro-multilang">
                <p>
                    🔊 <strong>Tap the speaker and listen carefully.</strong>
                    <br />
                    <span className="intro-sub">• (SR) Dodirni zvučnik i pažljivo poslušaj.</span>
                    <br />
                    <span className="intro-sub">• (DE) Tippe auf den Lautsprecher und höre gut zu.</span>
                </p>

                <p>
                    👂 <strong>Listen to each option if needed.</strong>
                    <br />
                    <span className="intro-sub">• (SR) Po želji preslušaj svaku opciju.</span>
                    <br />
                    <span className="intro-sub">• (DE) Höre dir jede Option an, wenn nötig.</span>
                </p>

                <p>
                    ✅ <strong>Choose the word you hear.</strong>
                    <br />
                    <span className="intro-sub">• (SR) Izaberi reč koju čuješ.</span>
                    <br />
                    <span className="intro-sub">• (DE) Wähle das Wort, das du hörst.</span>
                </p>
            </div>
        );
    };

    // 🔚 Finished screen
    if (currentQuestionIndex >= questions.length) {
        return (
            <div className="audio-quiz-container">
                <div className="audio-finish-card">
                    <h2 className="audio-quiz-title">🎉 Quiz Completed!</h2>
                    <p className="audio-quiz-finished-score">
                        Your score: {score} / {questions.length}
                    </p>
                    <div className="audio-quiz-links">
                        <a href="http://localhost:3000/" className="audio-quiz-link">
                            ← Back to Main Homepage
                        </a>
                        <a href="/" className="audio-quiz-link">
                            ← Back to Quizzes
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestionIndex];

    const playOptionAudio = (audioFile) => {
        const src = absolutize(audioFile);
        if (!src) return;

        const a = optionAudioRef.current;

        try {
            a.pause();
        } catch { }

        try {
            a.src = src;
            a.load();
        } catch { }

        safeRestart(a);
        safePlay(a);
    };

    const handleOptionSelect = (option) => {
        if (showFeedback || showIntro) return;

        // ✅ no click sound here
        setSelectedOption(option);

        // 🔊 play option audio
        playOptionAudio(option.audio_file);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;

        setShowFeedback(true);

        if (selectedOption.is_correct) {
            setScore((prev) => prev + 1);
            safeRestart(correctSound.current);
            safePlay(correctSound.current);
        } else {
            safeRestart(wrongSound.current);
            safePlay(wrongSound.current);
        }
    };

    const handleNext = () => {
        setSelectedOption(null);
        setShowFeedback(false);
        setCurrentQuestionIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="audio-quiz-container">
            {/* 🔹 Intro modal */}
            {showIntro && (
                <div className="intro-modal-backdrop">
                    <div className="intro-modal">
                        <h2>{quiz.title || "Audio Quiz"}</h2>
                        <p className="intro-type">Quiz type: Audio Listening</p>

                        {getInstructions()}

                        <div className="intro-skip">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem("fl_skip_intro_audio", "yes");
                                        } else {
                                            localStorage.removeItem("fl_skip_intro_audio");
                                        }
                                    }}
                                />
                                Don’t show instructions next time
                            </label>
                        </div>

                        <div className="intro-buttons">
                            <button type="button" className="intro-start-btn" onClick={() => setShowIntro(false)}>
                                Start Listening! 🎧
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="audio-quiz-title">{quiz.title}</h2>
            <p className="audio-quiz-progress">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            <div className="audio-quiz-inner">
                <div className="audio-quiz-left">
                    <img src={absolutize(question.image)} alt="quiz" className="audio-quiz-image" />
                </div>

                <div className="audio-quiz-right">
                    <div className="audio-quiz-options">
                        {(question.options || []).map((option) => {
                            let style = {};

                            if (selectedOption?.id === option.id && !showFeedback) {
                                style = { border: "3px solid #2196f3", backgroundColor: "#e3f2fd" };
                            }

                            if (showFeedback) {
                                if (option.is_correct) style = { backgroundColor: "#4caf50", color: "white" };
                                else if (selectedOption?.id === option.id)
                                    style = { backgroundColor: "#f44336", color: "white" };
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={showFeedback || showIntro}
                                    style={style}
                                    className="audio-option-btn"
                                >
                                    🔊 {option.text}
                                </button>
                            );
                        })}
                    </div>

                    {!showFeedback ? (
                        <>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedOption || showIntro}
                                className="audio-quiz-submit"
                            >
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
                        <div className="audio-quiz-feedback">
                            {selectedOption?.is_correct ? (
                                <p className="audio-correct">✅ Correct!</p>
                            ) : (
                                <p className="audio-wrong">
                                    ❌ Wrong! Correct answer: {(question.options || []).find((o) => o.is_correct)?.text}
                                </p>
                            )}
                            <button onClick={handleNext} className="audio-quiz-next">
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AudioQuizGame;
