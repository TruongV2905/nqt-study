import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./_providers/app-providers";

const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-heading" });

export const metadata: Metadata = { title: { default: "NQT Vocabulary", template: "%s · NQT Vocabulary" }, description: "Không gian học từ vựng tiếng Anh dành cho người Việt." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${dmSans.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
