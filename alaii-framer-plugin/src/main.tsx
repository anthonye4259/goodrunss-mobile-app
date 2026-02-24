import { framer } from "framer-plugin"
import "./App.css"

// Show the plugin UI
framer.showUI({
    width: 320,
    height: 440,
    position: "center",
})

import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"

const root = document.getElementById("root")
if (root) {
    createRoot(root).render(<App />)
}
