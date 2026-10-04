import Image from "next/image";
import student_img from "@/public/images/3d_student.jpg";

// Shared two-column layout for login and signup. The illustration
// column is hidden on small screens so the form gets the full width.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-[calc(100vh-6rem)] place-items-center px-4 py-10">
      <div className="card grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <h1 className="font-display text-4xl font-extrabold">
            <span className="highlight">{title}</span>
          </h1>
          {subtitle && <p className="mb-6 mt-3 text-muted">{subtitle}</p>}
          {children}
        </div>
        <div className="relative hidden place-items-center border-l-2 border-line bg-brand md:grid">
          <span className="sticker absolute left-6 top-6">Study together!</span>
          <Image
            src={student_img}
            alt="Illustration of a student"
            width={400}
            height={400}
            priority
            className="float max-h-[360px] w-auto rounded-3xl border-2 border-line object-cover"
          />
        </div>
      </div>
    </div>
  );
}
