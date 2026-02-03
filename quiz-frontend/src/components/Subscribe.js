import React, { useState } from "react";

function Subscribe() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://kidslearning-vhk7.onrender.com/api/subscribe/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setMessage("✅ Thank you for subscribing!");
                setEmail("");
            } else {
                setMessage("⚠️ Already subscribed or invalid email.");
            }
        } catch (err) {
            setMessage("❌ Something went wrong. Try again later.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "2rem", background: "#fdf6e3" }}>
            <h2>📩 Subscribe for Updates</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        width: "250px",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        marginLeft: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#ff9800",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Subscribe
                </button>
            </form>
            {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
        </div>
    );
}

export default Subscribe;
