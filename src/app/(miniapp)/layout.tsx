"use client";

export default function MiniAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64"></div>
      <div className="flex-grow md:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
