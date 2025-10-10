import Header from "@/components/ui/Header";


export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}