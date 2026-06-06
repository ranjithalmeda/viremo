export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen border-t-4 border-[var(--accent)]">{children}</div>;
}
