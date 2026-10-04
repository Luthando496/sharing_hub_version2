"use client";
import { useEffect, useState } from "react";
import { Moon, Sparkles } from "lucide-react";

const OPTIONS = [
  { value: "vibrant", label: "Vibrant theme", Icon: Sparkles },
  { value: "dark", label: "Dark theme", Icon: Moon },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "vibrant");
  }, []);

  const choose = (value) => {
    setTheme(value);
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("theme", value);
    } catch {}
  };

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="relative inline-grid grid-cols-2 rounded-full border-2 border-line bg-surface-2 p-0.5"
    >
      <span
        aria-hidden
        className="theme-thumb absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full border-2 border-line bg-brand transition-transform duration-300 ease-out"
      />
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          className={`relative z-10 grid h-8 w-9 cursor-pointer place-items-center rounded-full transition-colors ${
            theme === value ? "text-brand-ink" : "text-ink"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
