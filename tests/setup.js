import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.clearAllMocks();
  // browser-only cleanup (the API tests run in a plain Node environment)
  if (typeof document !== "undefined") {
    try {
      localStorage.clear();
    } catch {}
    delete document.documentElement.dataset.theme;
  }
});
