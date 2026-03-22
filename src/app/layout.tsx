import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEMPI - Únete YA !!",
  description: "CLICK AHORA PARA UNIRTE YA DE YA !!!!",
  icons: {
    icon: "https://i.postimg.cc/JhzS1nwy/icon.png",
  },
  openGraph: {
    title: "SEMPI - Únete YA !!",
    description: "CLICK AHORA PARA UNIRTE YA DE YA !!!!",
    images: ["https://i.postimg.cc/9XWxvCMw/smol.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEMPI - Únete YA !!",
    description: "CLICK AHORA PARA UNIRTE YA DE YA !!!!",
    images: ["https://i.postimg.cc/9XWxvCMw/smol.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5QLJRTBD');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased bg-[#030303]`}
        style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5QLJRTBD"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}