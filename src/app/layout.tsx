import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/utils/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ibc.fun",
  description: "ibc.fun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
