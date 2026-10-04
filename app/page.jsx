import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpenText,
  Calculator,
  Code2,
  Download,
  FlaskConical,
  FileText,
  Landmark,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";

const SUBJECTS = [
  { name: "Mathematics", Icon: Calculator, color: "bg-sun text-on-accent" },
  { name: "Computer Science", Icon: Code2, color: "bg-sky text-on-accent" },
  { name: "History", Icon: Landmark, color: "bg-pop text-on-accent" },
  { name: "Chemistry", Icon: FlaskConical, color: "bg-mint text-on-accent" },
  { name: "Literature", Icon: BookOpenText, color: "bg-brand text-brand-ink" },
  { name: "Physics", Icon: Atom, color: "bg-sun text-on-accent" },
];

const STEPS = [
  {
    Icon: Upload,
    title: "Drop your notes",
    text: "Snap, scan or save your notes, then upload a PDF, Word file or image in seconds.",
    color: "bg-sun text-on-accent",
    tilt: "-rotate-1",
  },
  {
    Icon: Search,
    title: "Find what you need",
    text: "Filter by subject and type, or search by title to land on the right study guide fast.",
    color: "bg-pop text-on-accent",
    tilt: "rotate-1",
  },
  {
    Icon: Download,
    title: "Download & ace it",
    text: "Grab anything for free. Every download tells the author their notes helped.",
    color: "bg-mint text-on-accent",
    tilt: "-rotate-1",
  },
];

function FloatingCard({ className = "", style, title, meta, Icon, color }) {
  return (
    <div
      className={`card absolute flex items-center gap-3 p-3 pr-5 ${className}`}
      style={style}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-line text-on-accent ${color}`}
      >
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display font-bold">{title}</span>
        <span className="block text-sm text-muted">{meta}</span>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:pt-16 lg:pb-24">
        <div
          aria-hidden
          className="absolute -bottom-10 -left-12 hidden h-44 w-44 rounded-full border-2 border-line bg-sun/50 lg:block"
        />
        <div
          aria-hidden
          className="absolute -right-10 bottom-10 h-40 w-40 rotate-12 rounded-3xl border-2 border-line bg-mint/60"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="sticker mb-6">
              <Sparkles size={16} /> By students, for students
            </span>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
              Share notes.
              <br />
              <span className="highlight">Ace exams.</span>
              <br />
              Do it together.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
              ResourceHub is a free pile of study guides, notes and past papers
              uploaded by classmates. Grab what you need, share what you&apos;ve
              got.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/resources" className="btn btn-brand text-lg">
                Browse resources <ArrowRight size={20} />
              </Link>
              <Link href="/upload-resources" className="btn btn-sun text-lg">
                <Upload size={20} /> Share yours
              </Link>
            </div>
          </div>

          {/* Collage of resource cards */}
          <div
            aria-hidden
            className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]"
          >
            <div className="card float absolute left-1/2 top-[44%] h-64 w-52 -translate-x-1/2 -translate-y-1/2 rotate-3 bg-brand p-5 text-brand-ink sm:h-72 sm:w-60">
              <FileText size={32} />
              <p className="mt-4 font-display text-2xl font-extrabold leading-tight">
                Calculus
                <br />
                cheat sheet
              </p>
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full rounded-full bg-brand-ink/40" />
                <div className="h-2 w-4/5 rounded-full bg-brand-ink/40" />
                <div className="h-2 w-3/5 rounded-full bg-brand-ink/40" />
              </div>
            </div>
            <FloatingCard
              Icon={Code2}
              color="bg-sky"
              title="Python basics"
              meta="PDF · 128 downloads"
              className="float-slow -left-2 top-4 -rotate-3 sm:left-0"
              style={{ "--r": "-3deg" }}
            />
            <FloatingCard
              Icon={FlaskConical}
              color="bg-mint"
              title="Organic chem"
              meta="Study guide"
              className="float -right-2 top-[58%] rotate-2 sm:right-0"
              style={{ "--r": "2deg" }}
            />
            <FloatingCard
              Icon={Landmark}
              color="bg-pop"
              title="WW2 timeline"
              meta="Notes · 4.9"
              className="float-slow bottom-0 left-2 rotate-1 sm:left-4"
              style={{ "--r": "1deg" }}
            />
            <span className="sticker absolute right-6 top-0 rotate-6">
              <Star size={14} className="fill-current" /> Free forever
            </span>
          </div>
        </div>
      </section>

      {/* Subject ticker */}
      <div className="marquee -rotate-1 overflow-hidden border-y-2 border-line bg-pop py-3 text-on-accent">
        <div className="marquee-track" aria-hidden>
          {[...SUBJECTS, ...SUBJECTS, ...SUBJECTS, ...SUBJECTS].map(
            ({ name, Icon }, i) => (
              <span
                key={i}
                className="mx-6 inline-flex items-center gap-3 font-display text-xl font-extrabold uppercase tracking-wide sm:text-2xl"
              >
                <Icon size={22} /> {name} <Star size={14} className="fill-current" />
              </span>
            )
          )}
        </div>
        <span className="sr-only">
          Subjects: {SUBJECTS.map((s) => s.name).join(", ")}
        </span>
      </div>

      {/* How it works */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title max-w-xl">
            How it <span className="highlight">works</span>
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ Icon, title, text, color, tilt }, i) => (
              <li
                key={title}
                className={`card card-hover relative p-6 pt-10 ${tilt}`}
              >
                <span
                  className={`absolute -top-5 left-6 grid h-12 w-12 place-items-center rounded-2xl border-2 border-line font-display text-xl font-extrabold text-on-accent ${color}`}
                >
                  {i + 1}
                </span>
                <Icon size={30} className="text-brand" />
                <h3 className="mt-3 text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title">
            Pick a <span className="highlight [--hl:var(--mint)]">subject</span>
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Jump straight into the stuff you&apos;re studying right now.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {SUBJECTS.map(({ name, Icon, color }) => (
              <Link
                key={name}
                href={`/resources?category=${encodeURIComponent(name)}`}
                className={`card card-hover wiggle group flex min-h-32 flex-col justify-between p-4 sm:min-h-40 sm:p-6 ${color}`}
              >
                <Icon size={34} />
                <span className="flex items-end justify-between gap-2">
                  <span className="font-display text-lg font-extrabold leading-tight sm:text-2xl">
                    {name}
                  </span>
                  <ArrowRight
                    size={22}
                    className="shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5">
        <div className="card relative mx-auto max-w-6xl overflow-hidden bg-brand p-8 text-center text-brand-ink sm:p-14">
          <span
            aria-hidden
            className="absolute -left-6 -top-6 h-24 w-24 rounded-full border-2 border-line bg-sun"
          />
          <span
            aria-hidden
            className="absolute -bottom-8 -right-6 h-28 w-28 rotate-12 rounded-3xl border-2 border-line bg-pop"
          />
          <h2 className="relative font-display text-3xl font-extrabold sm:text-5xl">
            Got notes? Someone needs them.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg opacity-90">
            Join in, upload what helped you, and help the next student study
            smarter.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-sun text-lg">
              Join for free
            </Link>
            <Link href="/resources" className="btn text-lg">
              Just browse
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
