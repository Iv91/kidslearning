
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./QuizPage.css";
import "../components/GiveUpButton.css";
import { safePlay, safeRestart } from "../utils/sound";

function QuizPage() {
    const { id } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [showNext, setShowNext] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // 🔹 Intro popup
    const [showIntro, setShowIntro] = useState(() => {
        return localStorage.getItem("fl_skip_intro_mcq") ? false : true;
    });

    // 🔊 Sounds
    const clickSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/click.wav`));
    const correctSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/correct.wav`));
    const wrongSound = useRef(new Audio(`${ process.env.PUBLIC_URL }/sounds/wrong.wav`));
    const finishSuccessSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_success.wav`)
    );
    const finishFailSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_fail.wav`)
    );
    const finishPlayed = useRef(false);

    // ✅ Unified API base (same as your other games)
    const RAW = (
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_API_BASE_URL ||
        "https://kidslearning-vhk7.onrender.com/api/"
    ).replace(/\/+$/, "");

    const API_BASE = RAW.endsWith("/api") ? RAW : `${ RAW }/api`;

    const buildApiUrl = (path) =>
        path.startsWith("http")
            ? path
            : `${ API_BASE }${ path.startsWith("/") ? "" : "/" }${ path }`;

    // ✅ Fetch quiz
    useEffect(() => {
        fetch(buildApiUrl(`/quizzes/${ id }/`))
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${ res.status }`);
                return res.json();
            })
            .then((data) => {
                setQuiz(data);

                // reset state when changing quiz
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setFeedback(null);
                setScore(0);
                setShowNext(false);
                setIsFinished(false);
                finishPlayed.current = false;
            })
            .catch((err) => console.error("❌ Failed to fetch quiz:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Optional: preload UI sounds
    useEffect(() => {
        [clickSound, correctSound, wrongSound, finishSuccessSound, finishFailSound].forEach(
            (ref) => {
                try {
                    ref.current.load();
                } catch { }
            }
        );
    }, []);

    const questions = useMemo(() => quiz?.questions || [], [quiz]);
    const question = questions[currentQuestionIndex];
    const correctOption = question?.options?.find((opt) => opt.is_correct);

    // 🔊 Finish sound once (do NOT play inside render)
    useEffect(() => {
        if (!isFinished) return;
        if (!questions.length) return;
        if (finishPlayed.current) return;

        finishPlayed.current = true;

        const percentage = (score / questions.length) * 100;
        if (percentage >= 50) {
            safeRestart(finishSuccessSound.current);
            safePlay(finishSuccessSound.current);
        } else {
            safeRestart(finishFailSound.current);
            safePlay(finishFailSound.current);
        }
    }, [isFinished, score, questions.length]);

    if (!quiz) return <p className="mcq-loading">Loading quiz...</p>;

    const handleOptionSelect = (option) => {
        if (showNext || showIntro) return;

        setSelectedOption(option);
        safeRestart(clickSound.current);
        safePlay(clickSound.current);
    };

    const handleSubmit = () => {
        if (!selectedOption) {
            setFeedback("❗ Please select an answer before submitting!");
            return;
        }

        if (!correctOption) {
            setFeedback("⚠️ This question has no correct option set.");
            setShowNext(true);
            return;
        }

        if (selectedOption.id === correctOption.id) {
            setFeedback("✅ Correct!");
            setScore((prev) => prev + 1);

            safeRestart(correctSound.current);
            safePlay(correctSound.current);
        } else {
            setFeedback(`❌ Wrong! Correct answer: ${ correctOption.text }`);

            safeRestart(wrongSound.current);
            safePlay(wrongSound.current);
        }

        setShowNext(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setFeedback(null);
            setShowNext(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setIsFinished(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // 🎉 Finished screen
    if (isFinished) {
        return (
            <div className="mcq-container">
                <div className="mcq-finish-card">
                    <h2 className="mcq-title">🎉 Quiz Completed!</h2>
                    <p className="mcq-score">
                        Your score: {score} / {questions.length}
                    </p>

                    <div className="mcq-links">
                        <a href="https://kidslearning-vhk7.onrender.com/">← Back to Main Homepage</a>
                        <a href="/">← Back to Quizzes</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mcq-container">
            {/* 🔹 Intro modal */}
            {showIntro && (
                <div className="intro-modal-backdrop">
                    <div className="intro-modal">
                        <h2>{quiz.title || "Multiple Choice Quiz"}</h2>
                        <p className="intro-type">Quiz type: Multiple Choice</p>

                        <div className="intro-multilang">
                            <p>
                                ✅ <strong>Choose the correct answer.</strong>
                                <br />
                                <span className="intro-sub">• (SR) Izaberi tačan odgovor.</span>
                                <br />
                                <span className="intro-sub">• (DE) Wähle die richtige Antwort.</span>
                            </p>
                            <p>
                                🧠 <strong>Then press Submit.</strong>
                                <br />
                                <span className="intro-sub">• (SR) Zatim klikni Submit.</span>
                                <br />
                                <span className="intro-sub">• (DE) Dann auf Submit klicken.</span>
                            </p>
                        </div>

                        <div className="intro-skip">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem("fl_skip_intro_mcq", "yes");
                                        } else {
                                            localStorage.removeItem("fl_skip_intro_mcq");
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
                                Start Quiz! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="mcq-title">{quiz.title}</h2>
            <p className="mcq-progress">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            {question && (
                <div className="mcq-card">
                    <h3 className="mcq-question">{question.text}</h3>

                    <div className="mcq-options">
                        {question.options.map((option) => {
                            const isSelected = selectedOption?.id === option.id;

                            let className = "mcq-option";
                            if (isSelected && !showNext) className += " selected";

                            if (showNext && correctOption) {
                                if (option.id === correctOption.id) className += " correct";
                                else if (isSelected) className += " wrong";
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={showNext || showIntro}
                                    className={className}
                                >
                                    {option.text}
                                </button>
                            );
                        })}
                    </div>

                    {!showNext ? (
                        <button
                            onClick={handleSubmit}
                            className="mcq-submit"
                            disabled={!selectedOption || showIntro}
                        >
                            Submit
                        </button>
                    ) : (
                        <button onClick={handleNext} className="mcq-next">
                            Next ➜
                        </button>
                    )}

                    {feedback && (
                        <p className={`mcq-feedback ${ feedback.includes("Correct") ? "ok" : "bad" }`}>
                            {feedback}
                        </p>
                    )}

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
                </div>
            )}
        </div>
    );
}

export default QuizPage;
