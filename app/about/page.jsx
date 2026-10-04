import Link from "next/link";
import { Users, Book, Heart, Target, Globe, Award } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Thumb from "../components/Thumb";

export const metadata = { title: "About" };

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    bio: "Education enthusiast with 10+ years in edtech",
    image:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "Maria Rodriguez",
    role: "Head of Content",
    bio: "Former teacher passionate about resource sharing",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "James Chen",
    role: "Lead Developer",
    bio: "Full-stack developer focused on educational platforms",
    image:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "Sarah Williams",
    role: "Community Manager",
    bio: "Connects students and fosters collaboration",
    image:
      "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
];

const stats = [
  { icon: Book, value: "5000+", label: "Resources shared", color: "bg-sun" },
  { icon: Users, value: "10,000+", label: "Active users", color: "bg-sky" },
  { icon: Globe, value: "50+", label: "Countries", color: "bg-mint" },
  { icon: Award, value: "98%", label: "Satisfaction rate", color: "bg-pop" },
];

const pillars = [
  {
    icon: Target,
    title: "Our vision",
    text: "To become the most trusted place for student resource sharing, breaking down barriers to education.",
    color: "bg-sun",
    tilt: "-rotate-1",
  },
  {
    icon: Heart,
    title: "Our values",
    text: "Collaboration, integrity, accessibility and innovation drive everything we do to support student success.",
    color: "bg-pop",
    tilt: "rotate-1",
  },
  {
    icon: Users,
    title: "Our community",
    text: "We believe in community-driven learning, where every student can both learn and teach.",
    color: "bg-mint",
    tilt: "-rotate-1",
  },
];

const tiltCycle = ["-rotate-1", "rotate-1", "rotate-1", "-rotate-1"];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About us" title="Knowledge is better when it's shared">
        We&apos;re building a global community where students share notes,
        resources and support each other&apos;s academic journey.
      </PageHeader>

      {/* Mission */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title">
            Our <span className="highlight">mission</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted">
            To create a global community where students can share knowledge,
            resources, and support each other through collaborative learning.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text, color, tilt }) => (
              <div key={title} className={`card card-hover p-6 ${tilt}`}>
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl border-2 border-line text-on-accent ${color}`}
                >
                  <Icon size={28} />
                </span>
                <h3 className="mt-4 text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y-2 border-line bg-surface-2 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title mb-10">By the numbers</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div
                key={label}
                className={`card p-4 text-center text-on-accent sm:p-6 ${color}`}
              >
                <Icon className="mx-auto mb-2" size={28} />
                <p className="font-display text-3xl font-extrabold sm:text-4xl">
                  {value}
                </p>
                <p className="text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title">
            Meet the <span className="highlight">team</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            The people working to make educational resources accessible to every
            student.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, i) => (
              <article
                key={member.name}
                className={`card card-hover overflow-hidden ${tiltCycle[i % 4]}`}
              >
                <Thumb
                  src={member.image}
                  alt={member.name}
                  className="h-48 w-full border-b-2 border-line"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="font-semibold text-brand">{member.role}</p>
                  <p className="mt-2 text-sm text-muted">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5">
        <div className="card mx-auto max-w-4xl bg-brand p-8 text-center text-brand-ink sm:p-12">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Join our community
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
            Become part of a growing network of students helping each other
            succeed.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-sun">
              Sign up now
            </Link>
            <Link href="/resources" className="btn">
              Browse resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
