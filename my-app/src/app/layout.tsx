// RESPONSIBILITY: Root layout — Server Component only.
// Wraps app in ThemeProvider and AppShell.
// No "use client" — data fetching and metadata only.
// DATA FLOW: layout.tsx → AppShellThemeProvider → AppShell → page content

import type { Metadata } from "next";
import "./globals.css";
import { AppShellThemeProvider } from "@/components/AppShell/AppShellThemeProvider";
import { AppShell } from "@/components/AppShell/AppShell";

export const metadata: Metadata = {
  title: "Smart POS 360",
  description: "Smart Restaurant Management & POS System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen bg-page text-text-primary antialiased" suppressHydrationWarning>
        <AppShellThemeProvider>
          <AppShell>{children}</AppShell>
        </AppShellThemeProvider>
      </body>
    </html>
  );
}
