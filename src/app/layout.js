import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import { LOCAL_MOVIE_CARD_URLS } from "@/lib/imagePreload";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rotomaker VFX — Behind Every Impossible Shot",
  description:
    "Premium VFX outsourcing — rotoscoping, paint, keying, wire removal, clean-up, matchmove, and 3D conversion for film, TV, and commercials.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <head>
        {LOCAL_MOVIE_CARD_URLS.map((href) => (
          <link key={href} rel="preload" as="image" href={href} fetchPriority="high" />
        ))}
      </head>
      <body className="min-h-full bg-[#030303] text-white">{children}</body>
    </html>
  );
}
