import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";

const LINKS = [
  { href: "/resources", label: "Browse resources" },
  { href: "/upload-resources", label: "Share your notes" },
  { href: "/about", label: "About us" },
  { href: "/login", label: "Log in" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t-2 border-line bg-surface-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-3xl font-extrabold"
          >
            <span className="grid h-11 w-11 -rotate-6 place-items-center rounded-xl border-2 border-line bg-sun text-on-accent">
              <BookOpen size={22} />
            </span>
            <span>
              Resource<span className="text-brand">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-muted">
            A pile of notes, guides and past papers, built by students who got
            tired of studying alone.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 font-semibold">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-brand hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t-2 border-dashed border-line/50 px-5 py-4 text-center text-sm text-muted">
        &copy; {year} ResourceHub. Made with{" "}
        <Heart size={14} className="-mt-0.5 inline fill-pop text-pop" /> for
        students.
      </div>
    </footer>
  );
}
