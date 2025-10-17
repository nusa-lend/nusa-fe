export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6">
            <img src="/assets/logos/logo-dark.png" alt="Nusa Logo" className="h-20 w-auto object-contain mx-auto" />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-text-charcoal mb-4 leading-tight">
            Local Stablecoin Lending Hub
          </h2>
          <p className="text-lg text-text-charcoal/70 mb-8 max-w-lg mx-auto">
            Empowering communities with decentralized stablecoin lending solutions
          </p>
        </div>

        <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 mb-8">
          <span className="text-text-charcoal font-semibold text-lg">Coming Soon to the website!</span>
        </div>
      </div>
    </div>
  );
}
