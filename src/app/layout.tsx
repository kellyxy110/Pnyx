import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Pnyx — Technology knowledge network", description: "Where technology conversations become organised knowledge." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
