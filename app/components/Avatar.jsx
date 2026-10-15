import { initials } from "@/lib/blog";

// Round profile picture, or the person's initials when they have none.
export default function Avatar({ name, src, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        style={style}
        className="shrink-0 rounded-full border-2 border-line object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      style={style}
      className="grid shrink-0 place-items-center rounded-full border-2 border-line bg-sun font-display font-extrabold text-on-accent"
    >
      {initials(name)}
    </span>
  );
}
