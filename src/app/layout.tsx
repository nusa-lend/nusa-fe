import type { Metadata } from "next";
import localFont from "next/font/local";
import { APP_NAME, APP_DESCRIPTION } from "@/constants/app";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const sfUIText = localFont({
  src: [
    {
      path: "../../public/fonts/sfui2/SFUIText-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-RegularItalic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-Semibold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-SemiboldItalic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-Heavy.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/sfui2/SFUIText-HeavyItalic.woff",
      weight: "800",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-sf-ui-text",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: "%s | Nusa",
  },
  description:
    APP_DESCRIPTION,
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <html lang="en" dir="" className={sfUIText.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}