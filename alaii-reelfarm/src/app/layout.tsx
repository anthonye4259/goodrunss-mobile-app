import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alaii ReelFarm — IG Reels Automation",
  description: "Internal tool for auto-generating and publishing Instagram Reels for Alaii marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <div className="header__logo">
              <div>
                <div className="header__brand">
                  alaii <span>reelfarm</span>
                </div>
                <div className="header__sub">IG Reels Automation</div>
              </div>
            </div>
            <div className="header__actions">
              <a href="/automations" className="btn btn--secondary">
                ⚡ Automations
              </a>
              <a href="/create" className="btn btn--primary">
                ✨ Create Reel
              </a>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
