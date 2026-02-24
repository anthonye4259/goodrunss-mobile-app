import * as functions from "firebase-functions"

/**
 * Wix Custom Element Widget Script
 *
 * Serves the JavaScript that defines the Alaii Booking custom element
 * for embedding in Wix websites. Wix loads this script URL and expects
 * a Web Component (Custom Element) class to be registered.
 */
export const wixWidget = functions.https.onRequest(async (_req, res) => {
    // Set CORS and caching headers
    res.set("Access-Control-Allow-Origin", "*")
    res.set("Content-Type", "application/javascript")
    res.set("Cache-Control", "public, max-age=3600")

    const js = `
class AlaiBookingWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['studio-code', 'widget-height', 'theme'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const studioCode = this.getAttribute('studio-code') || '';
        const height = this.getAttribute('widget-height') || '600';
        const theme = this.getAttribute('theme') || 'light';

        if (!studioCode) {
            this.shadowRoot.innerHTML = \`
                <style>
                    .alaii-placeholder {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 300px;
                        background: linear-gradient(135deg, #E8EDF2 0%, #F8FAFC 100%);
                        border-radius: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        color: #2D3748;
                        text-align: center;
                        padding: 32px;
                    }
                    .alaii-logo {
                        font-size: 32px;
                        font-weight: 700;
                        margin-bottom: 12px;
                        letter-spacing: -0.5px;
                    }
                    .alaii-logo .highlight {
                        color: #8AAFCF;
                    }
                    .alaii-message {
                        font-size: 14px;
                        color: #718096;
                        max-width: 280px;
                        line-height: 1.5;
                    }
                </style>
                <div class="alaii-placeholder">
                    <div class="alaii-logo">al<span class="highlight">aii</span></div>
                    <div class="alaii-message">
                        Configure your Studio Code in the widget settings to display your booking widget.
                    </div>
                </div>
            \`;
            return;
        }

        const embedUrl = \`https://dal-ai.com/s/\${studioCode}?embed=true&theme=\${theme}\`;

        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .alaii-container {
                    width: 100%;
                    min-height: \${height}px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                }
                iframe {
                    width: 100%;
                    height: \${height}px;
                    border: none;
                    border-radius: 12px;
                }
            </style>
            <div class="alaii-container">
                <iframe
                    src="\${embedUrl}"
                    title="Alaii Booking Widget"
                    allow="payment;camera;microphone"
                    loading="lazy"
                ></iframe>
            </div>
        \`;
    }
}

if (!customElements.get('alaii-booking')) {
    customElements.define('alaii-booking', AlaiBookingWidget);
}
`

    res.status(200).send(js)
})


/**
 * Wix Settings Panel
 *
 * Serves the HTML settings panel that appears when a Wix user
 * clicks the "Settings" button on the Alaii widget. Allows them
 * to configure their studio code, height, and theme.
 */
export const wixSettingsPanel = functions.https.onRequest(async (_req, res) => {
    res.set("Access-Control-Allow-Origin", "*")
    res.set("Content-Type", "text/html")

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alaii Widget Settings</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fff;
            color: #2D3748;
            padding: 20px;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #E2E8F0;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .logo .highlight { color: #8AAFCF; }
        .subtitle {
            font-size: 13px;
            color: #A0AEC0;
        }
        .field {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #4A5568;
            margin-bottom: 6px;
        }
        input, select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #CBD5E0;
            border-radius: 8px;
            font-size: 14px;
            color: #2D3748;
            background: #F7FAFC;
            transition: border-color 0.2s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #8AAFCF;
            box-shadow: 0 0 0 3px rgba(138, 175, 207, 0.15);
        }
        .hint {
            font-size: 12px;
            color: #A0AEC0;
            margin-top: 4px;
        }
        .save-btn {
            width: 100%;
            padding: 12px;
            background: #8AAFCF;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 8px;
        }
        .save-btn:hover {
            background: #7A9FBF;
        }
        .success {
            display: none;
            text-align: center;
            padding: 12px;
            background: #F0FFF4;
            color: #276749;
            border-radius: 8px;
            font-size: 13px;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">al<span class="highlight">aii</span></div>
            <div class="subtitle">Booking & Payments Widget</div>
        </div>
    </div>

    <div class="field">
        <label>Studio Code *</label>
        <input type="text" id="studioCode" placeholder="e.g. your-business-name" />
        <div class="hint">Find this in your Alaii dashboard under Settings → Embed</div>
    </div>

    <div class="field">
        <label>Widget Height (px)</label>
        <input type="number" id="widgetHeight" value="600" min="300" max="1200" />
    </div>

    <div class="field">
        <label>Theme</label>
        <select id="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </div>

    <button class="save-btn" onclick="saveSettings()">Save Settings</button>
    <div class="success" id="success">✓ Settings saved! Widget will update automatically.</div>

    <script>
        function saveSettings() {
            const settings = {
                studioCode: document.getElementById('studioCode').value,
                widgetHeight: document.getElementById('widgetHeight').value,
                theme: document.getElementById('theme').value
            };

            // Send settings to the Wix widget via postMessage
            window.parent.postMessage({
                type: 'alaii-settings',
                data: settings
            }, '*');

            // Show success message
            const el = document.getElementById('success');
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 3000);
        }
    </script>
</body>
</html>`

    res.status(200).send(html)
})
