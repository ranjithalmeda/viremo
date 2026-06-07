export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-theme min-h-screen border-t-4 border-[var(--admin-bg-tertiary)]">
      {children}
    </div>
  );
}
