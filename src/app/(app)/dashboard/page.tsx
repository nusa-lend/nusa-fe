export default function DashboardPage() {
  const farcasterMiniappUrl =
    "https://farcaster.xyz/~/developers/mini-apps/preview?url=https%3A%2F%2Fnusa-lend.netlify.app";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-white bg-[radial-gradient(ellipse_70%_70%_at_50%_10%,#f7fafc_80%,#f1f5f9_100%)] transition-colors">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto text-center shadow-xl rounded-3xl bg-white/90 border border-gray-100 p-4 sm:p-8 md:p-12 backdrop-blur-md">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto mb-4 sm:mb-6 w-full flex justify-center">
            <img
              src="/assets/logos/logo-dark.png"
              alt="Nusa Logo"
              className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-lg"
            />
          </div>
        </div>

        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-3 sm:mb-4 leading-tight font-[circular]">
            Local Stablecoin Lending Hub
          </h2>
          <p className="text-base sm:text-lg text-gray-600/90 mb-6 sm:mb-8 max-w-md sm:max-w-lg mx-auto font-[circular]">
            An innovative decentralized lending protocol designed to earn or borrow local stablecoin against world assets with competitive rates directly on Farcaster.
          </p>
        </div>

        <a
          href={farcasterMiniappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white/95 rounded-full shadow-md border border-gray-200 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-200"
        >
          <span className="text-gray-800 font-semibold text-base sm:text-lg font-[circular]">Launch Miniapp</span>
        </a>
      </div>
    </div>
  );
}
