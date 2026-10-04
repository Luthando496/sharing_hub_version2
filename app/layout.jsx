import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: {
    default: "ResourceHub | Student notes, shared",
    template: "%s | ResourceHub",
  },
  description:
    "Discover, share, and download study notes, guides and past papers made by students, for students.",
};

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Runs before first paint so the saved (or system) theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='vibrant'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'vibrant'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='vibrant'}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="vibrant"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--surface)",
              color: "var(--ink)",
              border: "2px solid var(--line)",
              boxShadow: "4px 4px 0 var(--shadow)",
              borderRadius: "1rem",
              fontWeight: 600,
            },
          }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
