import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Web3Provider } from "@/contexts/Web3Context";

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
        <html lang="en" className="dark overflow-x-hidden">
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[#030014] text-white min-h-screen overflow-x-hidden`}
            >
                <Web3Provider>
                    {/* Particle Background */}
                    <ParticleBackground />

                    {/* Background Effects */}
                    <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0" />
                    <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-0" />
                    <div className="fixed inset-0 bg-radial-bottom pointer-events-none z-0" />

                    {/* Animated Orbs - Hidden on small mobile, responsive sizes */}
                    <div className="orb orb-primary hidden sm:block w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] -top-[100px] md:-top-[200px] -left-[100px] md:-left-[200px] animate-float fixed z-0" />
                    <div className="orb orb-secondary hidden sm:block w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[500px] lg:h-[500px] top-[20%] -right-[100px] md:-right-[150px] animate-float-delayed fixed z-0" />
                    <div className="orb orb-accent hidden md:block w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bottom-[10%] left-[10%] animate-float-reverse fixed z-0" />
                    <div className="orb orb-primary hidden lg:block w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] bottom-[30%] right-[20%] animate-float fixed z-0" style={{ animationDelay: '4s' }} />

                    {/* Navigation */}
                    <Navbar />

                    {/* Main Content */}
                    <main className="relative z-10 min-h-screen">
                        {children}
                    </main>

                    {/* Footer */}
                    <Footer />
                </Web3Provider>
            </body>
        </html>
    );
}
