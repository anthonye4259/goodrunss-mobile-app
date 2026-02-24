import React, { useState } from "react"
import { framer } from "framer-plugin"

export function App() {
    const [studioCode, setStudioCode] = useState("")
    const [height, setHeight] = useState("600")
    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [inserted, setInserted] = useState(false)

    const handleInsert = async () => {
        if (!studioCode.trim()) return

        // Build the embed URL for the Alaii booking widget
        const embedUrl = `https://dal-ai.com/s/${studioCode.trim()}?embed=true&theme=${theme}`

        // Create an HTML embed component with the booking iframe
        const htmlContent = `
<div style="width:100%;min-height:${height}px;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
    <iframe
        src="${embedUrl}"
        style="width:100%;height:${height}px;border:none;border-radius:12px;"
        title="Alaii Booking Widget"
        allow="payment;camera;microphone"
        loading="lazy"
    ></iframe>
</div>`

        // Insert as an HTML component on the Framer canvas
        await framer.addComponentInstance({
            url: "https://framer.com/m/HTML-Embed-xQkl.js",
            attributes: {
                html: htmlContent,
            },
        })

        setInserted(true)
        setTimeout(() => setInserted(false), 3000)
    }

    return (
        <div className="plugin-container">
            <div className="plugin-header">
                <div className="logo">A</div>
                <div>
                    <h1>Alaii</h1>
                    <p className="subtitle">Booking & Payments</p>
                </div>
            </div>

            <div className="form-group">
                <label>Studio Code</label>
                <input
                    type="text"
                    placeholder="Enter your studio code"
                    value={studioCode}
                    onChange={(e) => setStudioCode(e.target.value)}
                    className="input"
                />
                <p className="hint">
                    Get your code from the Alaii app →{" "}
                    <a href="https://apps.apple.com/app/dal-ai/id6741868498" target="_blank" rel="noreferrer">
                        Download
                    </a>
                </p>
            </div>

            <div className="form-group">
                <label>Widget Height (px)</label>
                <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input"
                    min="300"
                    max="1200"
                />
            </div>

            <div className="form-group">
                <label>Theme</label>
                <div className="theme-toggle">
                    <button
                        className={`theme-btn ${theme === "light" ? "active" : ""}`}
                        onClick={() => setTheme("light")}
                    >
                        ☀️ Light
                    </button>
                    <button
                        className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                        onClick={() => setTheme("dark")}
                    >
                        🌙 Dark
                    </button>
                </div>
            </div>

            <button
                className={`insert-btn ${inserted ? "success" : ""}`}
                onClick={handleInsert}
                disabled={!studioCode.trim()}
            >
                {inserted ? "✅ Added to Canvas!" : "Add Booking Widget"}
            </button>

            <div className="features">
                <div className="feature-item">📅 Online Booking</div>
                <div className="feature-item">💳 Payments</div>
                <div className="feature-item">📱 Mobile App</div>
                <div className="feature-item">🤖 AI Assistant</div>
            </div>
        </div>
    )
}
