"use client";

import { BookOpenCheck } from "lucide-react";

const LoadingPage = () => {
  return (
    <section
      className="grid min-h-[70vh] place-items-center px-5"
      role="status"
      aria-live="polite"
    >
      <div className="card flex flex-col items-center p-8 text-center sm:p-10">
        <div className="float mb-5 grid h-20 w-20 place-items-center rounded-2xl border-2 border-line bg-sun text-on-accent">
          <BookOpenCheck size={40} />
        </div>
        <p className="font-display text-2xl font-extrabold">
          Sharpening pencils...
        </p>
        <p className="mt-1 text-muted">Fetching the good stuff.</p>
        <div className="mt-5 flex gap-2" aria-hidden>
          <span className="h-3 w-3 animate-bounce rounded-full bg-brand" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-pop [animation-delay:120ms]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-mint [animation-delay:240ms]" />
        </div>
      </div>
    </section>
  );
};

export default LoadingPage;
