import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./DragDropQuiz.css";
import { safePlay, safeRestart } from "../utils/sound";

function DragDropQuiz() {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [buckets, setBuckets] = useState({});
    const [items, setItems] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [imageMode, setImageMode] = useState("word");

    // 🔹 Intro popup flag
    const [showIntro, setShowIntro] = useState(() => {
        return localStorage.getItem("fl_skip_intro_dragdrop") ? false : true;
    });

    // 🔊 Sound effects (use PUBLIC_URL for safety)
    const dragSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/click.wav`)
    );
    const finishSuccessSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_success.wav`)
    );
    const finishFailSound = useRef(
        new Audio(`${ process.env.PUBLIC_URL }/sounds/finish_fail.wav`)
    );
    const finishPlayed = useRef(false);

    // ✅ Unified API base
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
        !url
            ? ""
            : url.startsWith("http")
                ? url
                : `${ SITE_BASE }${ url.startsWith("/") ? "" : "/" }${ url }`;

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
                setImageMode(data.image_mode || "word");

                const labels = [...new Set((data.sorting_pairs || []).map((p) => p.label))];
                const newBuckets = { unsorted: [] };
                labels.forEach((label) => (newBuckets[label] = []));

                const initialItems = (data.sorting_pairs || []).map((pair, index) => ({
                    id: `${ index }`,
                    item: pair.item,
                    label: pair.label,
                    image_url: pair.image_url,
                }));

                initialItems.forEach((it) => newBuckets.unsorted.push(it));
                setItems(initialItems);
                setBuckets(newBuckets);

                // reset state for replay
                setSubmitted(false);
                setScore(0);
                finishPlayed.current = false;
            })
            .catch((err) => console.error("❌ Failed to load Drag & Drop quiz:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Optional: preload UI sounds
    useEffect(() => {
        [dragSound, finishSuccessSound, finishFailSound].forEach((ref) => {
            try {
                ref.current.load();
            } catch { }
        });
    }, []);

    const onDragEnd = (result) => {
        // block dragging while intro popup is open
        if (showIntro) return;

        const { source, destination, draggableId } = result;
        if (!destination) return;

        const movedItem = items.find((i) => i.id === draggableId);
        if (!movedItem) return;

        setBuckets((prev) => {
            const nextBuckets = { ...prev };

            // remove from source
            nextBuckets[source.droppableId] = (nextBuckets[source.droppableId] || []).filter(
                (i) => i.id !== draggableId
            );

            // add to destination
            nextBuckets[destination.droppableId] = [
                ...(nextBuckets[destination.droppableId] || []),
                movedItem,
            ];

            return nextBuckets;
        });

        // 🔊 small sound when an item is dropped successfully
        safeRestart(dragSound.current);
        safePlay(dragSound.current);
    };

    const handleSubmit = () => {
        if (!items.length) return;

        let correct = 0;

        items.forEach((item) => {
            for (const [label, bucketItems] of Object.entries(buckets)) {
                const found = (bucketItems || []).some((i) => i.id === item.id);
                if (found && label === item.label) correct += 1;
            }
        });

        const finalScore = Math.round((correct / items.length) * 100);
        setScore(finalScore);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 🔊 Play finish sound once when submitted
    useEffect(() => {
        if (!submitted) return;
        if (!items.length) return;
        if (finishPlayed.current) return;

        finishPlayed.current = true;

        if (score >= 50) {
            safeRestart(finishSuccessSound.current);
            safePlay(finishSuccessSound.current);
        } else {
            safeRestart(finishFailSound.current);
            safePlay(finishFailSound.current);
        }
    }, [submitted, score, items.length]);

    // 🔹 Multilingual instructions for popup
    const getInstructions = () => {
        return (
            <div className="intro-multilang">
                <p>
                    🧩 <strong>Drag each item into the correct box.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Prevuci svaku stavku u odgovarajuću kutiju.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Ziehe jedes Element in die richtige Box.
                    </span>
                </p>

                <p>
                    👀 <strong>Look at the categories carefully.</strong>
                    <br />
                    <span className="intro-sub">• (SR) Pažljivo pogledaj kategorije.</span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Schau dir die Kategorien genau an.
                    </span>
                </p>

                <p>
                    ✋ <strong>Drag the picture or word with your finger or mouse.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Prevuci sliku ili reč prstom ili mišem.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Ziehe das Bild oder Wort mit dem Finger oder der Maus.
                    </span>
                </p>

                <p>
                    ✅ <strong>Drop it inside the category where it belongs.</strong>
                    <br />
                    <span className="intro-sub">
                        • (SR) Spusti je u kategoriju kojoj pripada.
                    </span>
                    <br />
                    <span className="intro-sub">
                        • (DE) Lass es in der passenden Kategorie fallen.
                    </span>
                </p>
            </div>
        );
    };

    if (!quiz || Object.keys(buckets).length === 0) return <p>Loading...</p>;

    return (
        <div className="dragdrop-container">
            {/* 🔹 Intro popup */}
            {showIntro && (
                <div className="intro-modal-backdrop">
                    <div className="intro-modal">
                        <h2>{quiz.title || "Drag & Drop Quiz"}</h2>
                        <p className="intro-type">Quiz type: Drag & Drop Sorting</p>

                        {getInstructions()}

                        <div className="intro-skip">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem("fl_skip_intro_dragdrop", "yes");
                                        } else {
                                            localStorage.removeItem("fl_skip_intro_dragdrop");
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

            <h2>{quiz.title}</h2>
            <p className="dragdrop-instructions">Drag each item into the correct category.</p>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="dragdrop-buckets">
                    {Object.entries(buckets).map(([label, bucketItems]) => (
                        <Droppable droppableId={label} key={label}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`dragdrop-bucket ${ label === "unsorted" ? "unsorted" : ""
                                        }`}
                                >
                                    <h4>{label === "unsorted" ? "Unsorted Items" : label}</h4>

                                    {(bucketItems || []).map((i, index) => (
                                        <Draggable key={i.id} draggableId={i.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="dragdrop-item"
                                                    style={{
                                                        backgroundColor: submitted
                                                            ? label === i.label
                                                                ? "#d0f5d0"
                                                                : "#fddede"
                                                            : "#fff",
                                                        ...provided.draggableProps.style,
                                                    }}
                                                >
                                                    {imageMode === "word" && i.image_url ? (
                                                        <img src={absolutize(i.image_url)} alt="" />
                                                    ) : null}
                                                    {i.item}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {!submitted ? (
                <>
                    <button onClick={handleSubmit} className="dragdrop-submit">
                        Submit
                    </button>

                    <div className="dragdrop-giveup-container">
                        <button
                            className="dragdrop-giveup"
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
                <div className="dragdrop-results">
                    <h3>Your Score: {score}%</h3>

                    <div className="dragdrop-links">
                        <a href="http://localhost:8000/">← Back to Main Homepage</a>
                        <a href="/">← Back to Quizzes</a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DragDropQuiz;
