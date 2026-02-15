  import type { Metadata } from "next";
  import "./globals.css";
  import Header from "./components/Header";

  export const metadata: Metadata = {
    title: "ProtonCode Solutions",
    description: "Medical Store SaaS",
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body className="bg-gray-100 text-gray-900 min-h-screen">
          <Header />
          {children}
        </body>
      </html>
    );
  }