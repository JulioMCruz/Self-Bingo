import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SdkInitializer } from "@/components/SdkInitializer";
import { FarcasterProvider } from "@/contexts/FarcasterContext";
import { WagmiConfig } from "@/providers/wagmi-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Self Bingo",
  description: "Blockchain-based bingo game with Self Protocol verification",
  generator: 'Self Bingo',
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: "https://www.selfbingo.xyz/self-bingo-preview.png",
      aspectRatio: "3:2",
      button: {
        title: "Play Self Bingo",
        action: {
          type: "launch_frame",
          name: "Self Bingo",
          url: "https://www.selfbingo.xyz",
          splashImageUrl: "https://www.selfbingo.xyz/self-bingo-splash.png",
          splashBackgroundColor: "#FCFF52"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WagmiConfig>
          <FarcasterProvider>
            <SdkInitializer />
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </FarcasterProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
