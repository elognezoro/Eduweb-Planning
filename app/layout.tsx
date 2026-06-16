import type { Metadata } from "next";
import { Nunito_Sans, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EduWeb Planner — Pilotage scolaire",
    template: "%s · EduWeb Planner",
  },
  description:
    "Plateforme internationale de gestion, de planification et de pilotage scolaire. Piloter, planifier et accompagner chaque parcours scolaire.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${nunito.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
