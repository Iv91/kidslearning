import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./VisualQuizGame.css";
import "../components/GiveUpButton.css";

function VisualQuizGame() {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [warning, setWarning] = useState("");
    const [showIntro, setShowIntro] = useState(() => {
        return localStorage.getItem("fl_skip_intro_visual") ? false : true;
    });

    // 🔊 Sound effects (files in public/sounds/)
    const clickSound = useRef(new Audio("/sounds/click.wav"));
    const correctSound = useRef(new Audio("/sounds/correct.wav"));
    const wrongSound = useRef(new Audio("/sounds/wrong.wav"));
    const finishSuccessSound = useRef(new Audio("/sounds/finish_success.wav"));
    const finishFailSound = useRef(new Audio("/sounds/finish_fail.wav"));
    const finishPlayed = useRef(false);

    // ✅ Unified API base (same pattern as other games)
    const RAW = (
        process.env.REACT_APP_API_URL ||
        process.env.REACT_APP_API_BASE_URL ||
        "https://kidslearning.live/api"
    ).replace(/\/+$/, "");

    const API_BASE = RAW.endsWith("/api") ? RAW : `${ RAW }/api`;
    const SITE_BASE = API_BASE.replace(/\/api$/, "");

    const buildApiUrl = (path) =>
        path.startsWith("http")
            ? path
            : `${ API_BASE }${ path.startsWith("/") ? "" : "/" }${ path }`;

    const absolutize = (url) =>
        !url
            ? ""
            : url.startsWith("http")
                ? url
                : `${ SITE_BASE }${ url.startsWith("/") ? "" : "/" }${ url }`;

    useEffect(() => {
        fetch(buildApiUrl(`/quizzes/visual-quiz/${ id }/`))

            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${ res.status }`);
                }
                return res.json();
            })
            .then((data) => setQuiz(data))
            .catch((err) => console.error("❌ Failed to load visual quiz:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!quiz) return <p>Loading quiz...</p>;

    const questions = quiz.questions || [];
    const isFinished = current >= questions.length;

    // 🔹 Instructions content (EN + SR + DE)
    const getInstructions = () => {
        return (
            <div className="intro-multilang">
                <p>
                    👀 <strong>Look at the big picture.</strong><br />
                    <span className="intro-sub">• (SR) Pogledaj veliku sliku.</span><br />
                    <span className="intro-sub">• (DE) Schau dir das große Bild an.</span>
                </p>

                <p>
                    ❓ <strong>Read the question.</strong><br />
                    <span className="intro-sub">• (SR) Pročitaj pitanje.</span><br />
                    <span className="intro-sub">• (DE) Lies die Frage.</span>
                </p>

                <p>
                    👆 <strong>Tap the small picture that matches the correct answer.</strong><br />
                    <span className="intro-sub">
                        • (SR) Dodirni malu sliku koja prikazuje tačan odgovor.
                    </span><br />
                    <span className="intro-sub">
                        • (DE) Tippe auf das kleine Bild mit der richtigen Antwort.
                    </span>
                </p>
            </div>
        );
    };

    // 🔊 Play finish sound once, based on pass / fail
    const playFinishSoundOnce = () => {
        if (finishPlayed.current || questions.length === 0) return;

        const percentage = (score / questions.length) * 100;

        try {
            if (percentage >= 50) {
                finishSuccessSound.current.currentTime = 0;
                finishSuccessSound.current.play();
            } else {
                finishFailSound.current.currentTime = 0;
                finishFailSound.current.play();
            }
        } catch (e) {
            console.warn("Finish sound error:", e);
        }

        finishPlayed.current = true;
    };

    // ✅ Finished screen
    if (isFinished) {
        playFinishSoundOnce();

        return (
            <div className="visualquiz-container">
                <div className="visualquiz-finish-card">
                    <h2 className="visualquiz-title">🎉 Quiz Finished!</h2>
                    <p className="visualquiz-score">
                        Your Score: {score} / {questions.length}
                    </p>

                    <div className="visualquiz-links">
                        <a href="https://kidslearning-vhk7.onrender.com/">← Back to Main Homepage</a>
                        <a href="/">← Back to Quizzes</a>
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[current];

    const handleSelect = (option) => {
        if (showFeedback || showIntro) return;

        // 🔊 click sound
        try {
            clickSound.current.currentTime = 0;
            clickSound.current.play();
        } catch (e) {
            console.warn("Click sound failed:", e);
        }

        setSelected(option);
        setWarning("");
    };

    const handleSubmit = () => {
        if (!selected) {
            setWarning("❗ Please choose an answer first.");
            return;
        }
        setShowFeedback(true);

        if (selected.is_correct) {
            setScore((prev) => prev + 1);

            // 🔊 correct sound
            try {
                correctSound.current.currentTime = 0;
                correctSound.current.play();
            } catch (e) {
                console.warn("Correct sound failed:", e);
            }
        } else {
            // 🔊 wrong sound
            try {
                wrongSound.current.currentTime = 0;
                wrongSound.current.play();
            } catch (e) {
                console.warn("Wrong sound failed:", e);
            }
        }
    };

    const nextQuestion = () => {
        setSelected(null);
        setShowFeedback(false);
        setWarning("");
        setCurrent((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="visualquiz-container">
            {/* 🔹 Intro popup */}
            {showIntro && (
                <div className="intro-modal-backdrop">
                    <div className="intro-modal">
                        <h2>{quiz.title || "Visual Quiz"}</h2>
                        <p className="intro-type">Quiz type: Picture Choice</p>

                        {getInstructions()}

                        {/* Skip next time */}
                        <div className="intro-skip">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem("fl_skip_intro_visual", "yes");
                                        } else {
                                            localStorage.removeItem("fl_skip_intro_visual");
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

            <h2 className="visualquiz-title">{quiz.title}</h2>
            <p className="visualquiz-progress">
                Question {current + 1} of {questions.length}
            </p>

            {/* 🎯 TWO-COLUMN AREA */}
            <div className="visualquiz-inner">
                {/* LEFT: text + big image */}
                <div className="visualquiz-left">
                    <h3 className="visualquiz-question-text">
                        {question.question_text}
                    </h3>

                    {question.question_image_url && (
                        <img
                            src={absolutize(question.question_image_url)}
                            alt="question"
                            className="visualquiz-question-image"
                        />
                    )}
                </div>

                {/* RIGHT: option images + buttons */}
                <div className="visualquiz-right">
                    <div className="visualquiz-options">
                        {question.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className={`visualquiz-option ${ showFeedback
                                    ? option.is_correct
                                        ? "correct"
                                        : selected?.id === option.id
                                            ? "wrong"
                                            : ""
                                    : selected?.id === option.id
                                        ? "selected"
                                        : ""
                                    }`}
                                disabled={showFeedback || showIntro}
                            >
                                <img
                                    src={absolutize(option.image_url)}
                                    alt="option"
                                    className="visualquiz-option-image"
                                />
                            </button>
                        ))}
                    </div>

                    {warning && <p className="visualquiz-warning">{warning}</p>}

                    {!showFeedback ? (
                        <button
                            onClick={handleSubmit}
                            className="visualquiz-submit"
                            disabled={!selected || showIntro}
                        >
                            Submit
                        </button>
                    ) : (
                        <div className="visualquiz-feedback">
                            {selected?.is_correct ? (
                                <p className="correct-text">✅ Correct!</p>
                            ) : (
                                <p className="wrong-text">
                                    ❌ Wrong! Try next one.
                                </p>
                            )}
                            <button onClick={nextQuestion} className="visualquiz-next">
                                Next
                            </button>
                        </div>
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
            </div>
        </div>
    );
}

export default VisualQuizGame;
