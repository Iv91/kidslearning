import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

function Footer() {
    const { t, lang } = useLang();
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");



    return (
        <footer
            style={{
                background: "#f6f5f8",
                marginTop: "4rem",
                paddingTop: "3rem",
            }}
        >
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
                <h5 style={{ fontWeight: 700, marginBottom: "1rem" }}>
                    {lang === "sr" ? "Kontakt" : lang === "de" ? "Kontakt" : "Get Contact"}
                </h5>

                <p style={{ marginBottom: "0.3rem" }}>
                    📞 (406) 555-0120
                </p>
                <p>
                    📧 <a href="mailto:admin@example.com">admin@example.com</a>
                </p>


            </div>

            <div
                style={{
                    borderTop: "1px solid #e5e7eb",
                    marginTop: "3rem",
                    padding: "1rem 0",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    color: "#6b7280",
                }}
            >
                © 2025 KidsLearning. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
