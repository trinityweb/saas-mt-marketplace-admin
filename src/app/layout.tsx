import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import "./globals.css";

// Se importará el preload desde el cliente

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marketplace Admin - SaaS Multi-Tenant",
  description: "Panel de administración del marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          themes={["light", "dark", "dim"]}
          disableTransitionOnChange={false}
        >
          <ErrorBoundary>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
