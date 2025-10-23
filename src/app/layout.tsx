import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { IdentityProvider } from "@/contexts/IdentityContext";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NIMBUS - DropPilot Airdrop Automation",
  description:
    "Set it and forget it airdrop farming. Your automated agent works 24/7 to farm crypto airdrops across multiple chains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <IdentityProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
            </IdentityProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
