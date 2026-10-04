export default function PageHeader({ eyebrow, title, children }) {
  return (
    <section className="px-5 pb-6 pt-12 sm:pt-16">
      <div className="mx-auto max-w-6xl">
        {eyebrow && <span className="sticker mb-4">{eyebrow}</span>}
        <h1 className="section-title max-w-3xl">{title}</h1>
        {children && (
          <p className="mt-4 max-w-2xl text-lg text-muted">{children}</p>
        )}
      </div>
    </section>
  );
}
