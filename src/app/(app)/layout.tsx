export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}