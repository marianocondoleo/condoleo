import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Condoleo. Cuida tu pisada.",
  description: "Cuida tu pisada con nosotros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      signInUrl="/sign-in" 
      signUpUrl="/sign-up"
      signOutRedirectUrl="/sign-in"
      afterSignInUrl="/home"
    >
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}