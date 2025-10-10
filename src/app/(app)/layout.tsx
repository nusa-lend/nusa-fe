import Providers from "@/components/providers/Providers";

export default async function AppLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: any;
  }) {
    return (
      <Providers>
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="w-full flex-none md:w-64"> </div>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
      </Providers>
    );
  }