"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { useUser } from "@/lib/supabase/useUser";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/resources", label: "Browse" },
  { href: "/upload-resources", label: "Share" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // close the mobile menu whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  const accountLink = user
    ? { href: "/profile", label: "Profile" }
    : { href: "/login", label: "Log in" };

  return (
    <>
      <div
        aria-hidden
        className="fixed left-0 top-0 z-[60] h-1 w-full origin-left bg-pop"
        style={{ transform: `scaleX(${progress})` }}
      />
      <header
        className={`sticky top-0 z-50 px-3 transition-[padding] duration-300 ease-out sm:px-5 ${
          scrolled ? "pt-2" : "pt-4"
        }`}
      >
        <div
          className={`mx-auto max-w-6xl border-2 border-line transition-all duration-300 ease-out ${
            scrolled
              ? "bg-surface/85 py-1.5 shadow-[4px_4px_0_var(--shadow)] backdrop-blur-md"
              : "bg-surface py-2.5 shadow-[5px_5px_0_var(--shadow)]"
          } ${scrolled && !open ? "rounded-full" : "rounded-3xl"}`}
        >
          <nav className="flex items-center justify-between gap-3 px-3 sm:px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight"
            >
              <span className="grid h-9 w-9 -rotate-6 place-items-center rounded-xl border-2 border-line bg-sun text-on-accent transition-transform hover:rotate-6">
                <BookOpen size={18} />
              </span>
              <span>
                Resource<span className="text-brand">Hub</span>
              </span>
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-full px-4 py-2 text-base font-bold transition-colors ${
                      isActive(href)
                        ? "bg-brand text-brand-ink"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href={accountLink.href}
                className="btn btn-pop btn-sm hidden md:inline-flex"
              >
                {accountLink.label}
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border-2 border-line bg-surface-2 md:hidden"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          <div
            id="mobile-menu"
            className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <ul
              className={`flex flex-col gap-1 overflow-hidden px-3 ${
                open ? "pb-3 pt-3" : ""
              }`}
              inert={!open}
            >
              {[...LINKS, accountLink].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`block rounded-2xl border-2 px-4 py-3 text-lg font-bold ${
                      isActive(href)
                        ? "border-line bg-brand text-brand-ink"
                        : "border-transparent hover:bg-surface-2"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link href="/signup" className="btn btn-sun mt-1 w-full">
                    Join for free
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
