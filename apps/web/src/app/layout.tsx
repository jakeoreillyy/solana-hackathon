import "./globals.css";

export const metadata = {
  title: "TrustTag | Objects worth keeping",
  description: "Discover exceptional pre-loved pieces with ownership history you can trust.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#1D1D1F] antialiased">{children}</body>
    </html>
  );
}