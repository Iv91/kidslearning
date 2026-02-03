import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function GamesPage() {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/quizzes/")
            .then((res) => res.json())
            .then((data) => setQuizzes(data));
    }, []);

    return (
        <div style={{ padding: "12rem 2rem" }}>
            <h2>Games & Quizzes</h2>
            <p>Choose a quiz or game type to begin practicing English!</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {quizzes.map((quiz) => {
                    const url =
                        quiz.quiz_type === "drag_drop"
                            ? `/drag-quiz/${ quiz.id }`
                            : `/quiz/${ quiz.id }`;

                    return (
                        <div
                            key={quiz.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                borderRadius: "8px",
                            }}
                        >
                            <h3>{quiz.title}</h3>
                            <p>Type: {quiz.quiz_type.replaceAll("_", " ")}</p>
                            <p>Difficulty: {quiz.difficulty}</p>
                            <Link
                                to={url}
                                style={{
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    padding: "0.5rem 1rem",
                                    textDecoration: "none",
                                    borderRadius: "6px",
                                    display: "inline-block",
                                    marginTop: "0.5rem",
                                }}
                            >
                                Play
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default GamesPage;
