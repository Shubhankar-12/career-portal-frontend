import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Careers Page Builder",
  description: "Build beautiful branded careers pages",
  keywords: "careers, jobs, recruitment, hiring, career page builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ToastContainer position="top-right" autoClose={5000} />

        {children}
      </body>
    </html>
  );
}
