import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AudioProvider } from "@/components/AudioContext";

export const metadata: Metadata = {
  title: "Gita-GPT | Divine Guidance",
  description: "Experience the wisdom of the Bhagavad Gita through our AI-powered spiritual guide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AudioProvider>
            {children}
          </AudioProvider>
        </Providers>
      </body>
    </html>
  );
}
