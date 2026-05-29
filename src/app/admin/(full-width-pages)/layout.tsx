// src/app/(admin)/(full-width-pages)/layout.tsx
"use client";
import { ThemeProvider } from '@/context/ThemeContext';

export default function FullWidthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </ThemeProvider>
  );
}