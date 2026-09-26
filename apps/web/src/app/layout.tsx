import "./globals.css";

export const metadata = { title: "TrustTag" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#1D1D1F] antialiased">{children}</body>
    </html>
  );
}