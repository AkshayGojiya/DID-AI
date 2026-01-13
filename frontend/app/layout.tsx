import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "VerifyX | Decentralized Identity Verification",
    description:
        "Secure, AI-powered decentralized identity verification. Own your identity with blockchain-backed credentials and privacy-first verification.",
    keywords: [
        "decentralized identity",
        "DID",
        "identity verification",
        "blockchain",
        "AI verification",
        "KYC",
        "self-sovereign identity",
    ],
    authors: [{ name: "VerifyX Team" }],
    openGraph: {
        title: "VerifyX | Decentralized Identity Verification",
        description:
            "Secure, AI-powered decentralized identity verification. Own your identity with blockchain-backed credentials.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[#030014] text-white min-h-screen`}
            >
                {/* Particle Background */}
                <ParticleBackground />

                {/* Background Effects */}
                <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0" />
                <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-0" />
                <div className="fixed inset-0 bg-radial-bottom pointer-events-none z-0" />

                {/* Animated Orbs */}
                <div className="orb orb-primary w-[600px] h-[600px] -top-[200px] -left-[200px] animate-float fixed z-0" />
                <div className="orb orb-secondary w-[500px] h-[500px] top-[20%] -right-[150px] animate-float-delayed fixed z-0" />
                <div className="orb orb-accent w-[400px] h-[400px] bottom-[10%] left-[10%] animate-float-reverse fixed z-0" />
                <div className="orb orb-primary w-[300px] h-[300px] bottom-[30%] right-[20%] animate-float fixed z-0" style={{ animationDelay: '4s' }} />

                {/* Navigation */}
                <Navbar />

                {/* Main Content */}
                <main className="relative z-10 min-h-screen">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </body>
        </html>
    );
}
