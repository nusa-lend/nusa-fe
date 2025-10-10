"use client";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center h-screen px-4">
                <h1 className="text-6xl font-bold text-text mb-6 text-center">
                    Welcome to Nusa
                </h1>
                <p className="text-xl text-text/70 text-center max-w-2xl mb-8">
                    Local Stablecoin Lending Hub - Your gateway to decentralized finance
                </p>
            </section>
        </div>
    );
}