import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepAI - Interview Preparation",
  description: "AI-driven interview preparation platform",
};

import { Providers } from '@/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-lg font-bold">PrepAI</div>
              <div className="space-x-4">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/questions" className="hover:underline">Questions</Link>
                <AuthLinks />
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}

function AuthLinks() {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        <span>Welcome, {user.email}</span>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="hover:underline bg-transparent border-none text-white cursor-pointer">
            Logout
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="hover:underline">Login</Link>
      <Link href="/signup" className="hover:underline">Sign Up</Link>
    </>
  );
}
